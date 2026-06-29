import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/app/model";
import {
  applyServerNotebookMetadata,
  type CodeBlock,
  createLocalDraftNotebook,
  createCodeBlock,
  createLocalNotebookRepository,
  createTextBlock,
  deleteBlock,
  insertBlockAfter,
  insertBlockBefore,
  moveBlock,
  notebookContentBlockIds,
  resolveGeneratedCodeInsertionTarget,
  updateCodeBlockSource,
  updateTextBlockMarkdown,
} from "@/entities/notebook";
import type { Notebook, NotebookBlock, NotebookRepository } from "@/entities/notebook";
import {
  DEFAULT_NOTEBOOK_TITLE,
  DEFAULT_SYNC_META,
  normalizeNotebookTitle,
  sampleNotebook,
} from "@/entities/notebook";
import type { NotebookSyncMeta } from "@/entities/notebook";
import { createAutosaver } from "@/shared/lib";
import type { OutputItem } from "@/entities/output";
import { notebookWorkerBridge, toRuntimeExecutionRequest } from "@/features/execution";
import type { ExecutionStatus } from "@/features/execution";
import {
  deleteServerNotebook,
  adoptServerVersion,
  fetchServerVersion,
  patchNotebookTitleOnServer,
  syncNotebook,
} from "@/features/sync";
import type { BlockActions } from "./types";

/** Debounce window for notebook autosave (ms). */
export const NOTEBOOK_AUTOSAVE_DELAY_MS = 800;

const defaultNotebookRepository = createLocalNotebookRepository();

type UseNotebookEditorOptions = {
  repository?: NotebookRepository;
  navigate?: (path: string) => void;
};

function maxBlockNumber(blocks: NotebookBlock[]): number {
  let max = 0;
  for (const block of blocks) {
    const match = /^blk_new_(?:code|text)_(\d+)$/.exec(block.id);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return max;
}

function notebookForRoute(notebookId: string | null) {
  if (!notebookId) {
    return createLocalDraftNotebook("local-preview", DEFAULT_NOTEBOOK_TITLE);
  }

  if (notebookId === sampleNotebook.id) {
    return sampleNotebook;
  }

  return createLocalDraftNotebook(notebookId, DEFAULT_NOTEBOOK_TITLE);
}

export function useNotebookEditor(
  notebookId: string | null,
  options: UseNotebookEditorOptions = {},
) {
  const [notebook, setNotebook] = useState(() => notebookForRoute(notebookId));
  const [syncMeta, setSyncMeta] = useState<NotebookSyncMeta>(DEFAULT_SYNC_META);
  // Keep the latest notebook in a ref so an in-flight sync persists the most
  // recent content (not a stale closure capture) once it resolves.
  const notebookRef = useRef(notebook);
  // Flags that the user edited the notebook while a sync was in flight, so the
  // resolved "synced" status must be downgraded to "unsynced".
  const dirtyDuringSyncRef = useRef(false);
  const [nextBlockNumber, setNextBlockNumber] = useState(1);
  const nextExecutionNumberRef = useRef(1);
  const repositoryRef = useRef<NotebookRepository>(
    options.repository ?? defaultNotebookRepository,
  );
  const navigateRef = useRef<(path: string) => void>(options.navigate ?? (() => {}));
  // The autosaver is created once, so it must read the current sync meta from a
  // ref (kept in sync by an effect) to avoid persisting stale metadata.
  const syncMetaRef = useRef<NotebookSyncMeta>(syncMeta);
  const autosaverRef = useRef(
    createAutosaver<Notebook>({
      save: (value) => repositoryRef.current.save(value, syncMetaRef.current),
      delayMs: NOTEBOOK_AUTOSAVE_DELAY_MS,
    }),
  );
  const execution = useAppStore((state) => state.execution);
  const removeNotebookListItem = useAppStore((state) => state.removeNotebookListItem);
  const startExecution = useAppStore((state) => state.startExecution);
  const updateNotebookListItemTitle = useAppStore(
    (state) => state.updateNotebookListItemTitle,
  );
  const markBlockRunning = useAppStore((state) => state.markBlockRunning);
  const clearBlockOutputsForRun = useAppStore((state) => state.clearBlockOutputsForRun);
  const appendBlockOutput = useAppStore((state) => state.appendBlockOutput);
  const completeBlockExecution = useAppStore((state) => state.completeBlockExecution);
  const recordExecutionError = useAppStore((state) => state.recordExecutionError);
  const disposeExecutionSession = useAppStore((state) => state.disposeExecutionSession);
  const markExecutionStopping = useAppStore((state) => state.markExecutionStopping);
  const selectedBlockId = useAppStore((state) => state.blockUi.selectedBlockId);

  const editedSinceLoadRef = useRef(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Keep the ref current so the once-created autosaver always persists the
  // latest sync meta alongside the notebook.
  useEffect(() => {
    syncMetaRef.current = syncMeta;
  }, [syncMeta]);

  useEffect(() => {
    navigateRef.current = options.navigate ?? (() => {});
  }, [options.navigate]);

  useEffect(() => {
    notebookRef.current = notebook;
  }, [notebook]);

  useEffect(() => {
    let cancelled = false;
    editedSinceLoadRef.current = false;
    autosaverRef.current.cancel();
    setNextBlockNumber(1);
    nextExecutionNumberRef.current = 1;
    // Dispose worker bridge (side effect) before resetting slice state.
    notebookWorkerBridge.dispose();
    disposeExecutionSession();
    // Seed synchronously so a route change shows the right notebook at once.
    setNotebook(notebookForRoute(notebookId));
    setSyncMeta(DEFAULT_SYNC_META);

    if (!notebookId) {
      return () => {
        cancelled = true;
      };
    }

    void repositoryRef.current.load(notebookId).then((restored) => {
      // Apply the persisted notebook only if one exists and the user has not
      // started editing the freshly seeded one (avoids clobbering edits).
      if (!cancelled && restored && !editedSinceLoadRef.current) {
        setNotebook(restored.notebook);
        setSyncMeta(restored.sync);
        setNextBlockNumber(maxBlockNumber(restored.notebook.blocks) + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [disposeExecutionSession, notebookId]);

  // Apply an edit and schedule a debounced autosave of the resulting notebook.
  // Only real edits go through here, so loading/seeding never triggers a save.
  const applyNotebookChange = (updater: (current: Notebook) => Notebook) => {
    editedSinceLoadRef.current = true;
    if (syncMetaRef.current.status === "syncing") {
      dirtyDuringSyncRef.current = true;
    }
    setSyncMeta((m) => (m.status === "synced" ? { ...m, status: "unsynced" } : m));
    setNotebook((current) => {
      const next = updater(current);
      notebookRef.current = next;
      autosaverRef.current.schedule(next);
      return next;
    });
  };

  const persistNotebook = async (
    nextNotebook: Notebook,
    nextSyncMeta: NotebookSyncMeta = syncMetaRef.current,
  ) => {
    notebookRef.current = nextNotebook;
    syncMetaRef.current = nextSyncMeta;
    await repositoryRef.current.save(nextNotebook, nextSyncMeta);
  };

  const createBlockId = (type: NotebookBlock["type"]) => {
    const blockId = `blk_new_${type}_${nextBlockNumber}`;
    setNextBlockNumber((current) => current + 1);
    return blockId;
  };

  const insertBlock = (
    blockId: string,
    type: NotebookBlock["type"],
    position: "before" | "after",
  ) => {
    const newBlockId = createBlockId(type);
    const newBlock =
      type === "text" ? createTextBlock(newBlockId) : createCodeBlock(newBlockId);
    const insert = position === "before" ? insertBlockBefore : insertBlockAfter;

    applyNotebookChange((currentNotebook) => ({
      ...currentNotebook,
      blocks: insert(currentNotebook.blocks, blockId, newBlock),
    }));
  };

  const applyGeneratedCode = (sourceBlockId: string, source: string) => {
    const target = resolveGeneratedCodeInsertionTarget(notebook.blocks, sourceBlockId);

    if (target.kind === "new-after-source") {
      const newBlockId = createBlockId("code");
      const newBlock = createCodeBlock(newBlockId, source);

      applyNotebookChange((currentNotebook) => ({
        ...currentNotebook,
        blocks: insertBlockAfter(currentNotebook.blocks, sourceBlockId, newBlock),
      }));
      return;
    }

    applyNotebookChange((currentNotebook) => {
      return {
        ...currentNotebook,
        blocks: updateCodeBlockSource(currentNotebook.blocks, target.blockId, source),
      };
    });
  };

  const createExecutionId = () => {
    const executionId = `exec_${notebook.id}_${nextExecutionNumberRef.current}`;
    nextExecutionNumberRef.current += 1;
    return executionId;
  };

  const getCodeBlock = (blockId: string): CodeBlock | null => {
    const block = notebook.blocks.find((candidate) => candidate.id === blockId);
    if (!block || block.type !== "code") {
      return null;
    }

    return block;
  };

  const getAllCodeBlocks = (): CodeBlock[] =>
    notebook.blocks.filter((block): block is CodeBlock => block.type === "code");

  const getCodeBlocksFromHere = (blockId: string): CodeBlock[] => {
    const startIndex = notebook.blocks.findIndex((block) => block.id === blockId);
    if (startIndex < 0) {
      return [];
    }

    return notebook.blocks
      .slice(startIndex)
      .filter((block): block is CodeBlock => block.type === "code");
  };

  const runCodeBlocks = (
    command: "run-current" | "run-all" | "run-from-here",
    blocks: CodeBlock[],
    targetBlockId: string,
  ) => {
    if (
      blocks.length === 0 ||
      execution.status === "running" ||
      execution.status === "stopping"
    ) {
      return;
    }

    const executionId = createExecutionId();
    const request = toRuntimeExecutionRequest(
      {
        command,
        executionId,
        targetBlockId,
      },
      blocks.map((block) => ({
        blockId: block.id,
        source: block.content.source,
      })),
    );

    if (!request) {
      return;
    }

    startExecution(request);
    for (const block of blocks) {
      clearBlockOutputsForRun(executionId, block.id);
    }

    void notebookWorkerBridge.run(request, {
      onMessage: (message) => {
        switch (message.type) {
          case "execution-started":
            markBlockRunning(message.executionId, message.blockId);
            break;
          case "execution-output":
            appendBlockOutput(message.executionId, message.blockId, message.output);
            break;
          case "execution-complete":
            completeBlockExecution(message.executionId, message.blockId);
            break;
          case "execution-error":
            recordExecutionError(message.executionId, message.error, message.blockId);
            break;
        }
      },
      onError: ({
        executionId: runtimeExecutionId,
        blockId: runtimeBlockId,
        error,
      }) => {
        recordExecutionError(runtimeExecutionId, error, runtimeBlockId);
      },
    });
  };

  const actions: BlockActions = {
    addBlockBefore: (blockId, type) => insertBlock(blockId, type, "before"),
    addBlockAfter: (blockId, type) => insertBlock(blockId, type, "after"),
    deleteBlockById: (blockId) => {
      applyNotebookChange((currentNotebook) => ({
        ...currentNotebook,
        blocks: deleteBlock(currentNotebook.blocks, blockId),
      }));
    },
    moveBlockById: (blockId, direction) => {
      applyNotebookChange((currentNotebook) => ({
        ...currentNotebook,
        blocks: moveBlock(currentNotebook.blocks, blockId, direction),
      }));
    },
    runAll: () => {
      const blocks = getAllCodeBlocks();
      const firstBlockId = blocks[0]?.id;
      if (!firstBlockId) {
        return;
      }

      runCodeBlocks("run-all", blocks, firstBlockId);
    },
    runBlock: (blockId) => {
      const block = getCodeBlock(blockId);
      if (!block) {
        return;
      }

      runCodeBlocks("run-current", [block], blockId);
    },
    runFromHere: (blockId) => {
      const blocks = getCodeBlocksFromHere(blockId);
      if (blocks.length === 0) {
        return;
      }

      runCodeBlocks("run-from-here", blocks, blockId);
    },
    stopExecution: () => {
      const { activeExecutionId, status, targetBlockId } = execution;
      if (!activeExecutionId || status !== "running") {
        return;
      }
      // Stop the worker bridge first (side effect lives here, not in the slice).
      notebookWorkerBridge.stop(activeExecutionId);
      // Then update slice state + schedule the canceled error.
      markExecutionStopping(activeExecutionId, targetBlockId);
    },
    updateText: (blockId, markdown) => {
      applyNotebookChange((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateTextBlockMarkdown(currentNotebook.blocks, blockId, markdown),
      }));
    },
    updateCode: (blockId, source) => {
      applyNotebookChange((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateCodeBlockSource(currentNotebook.blocks, blockId, source),
      }));
    },
    applyGeneratedCode,
  };

  const contentBlockIds = notebookContentBlockIds(notebook);
  const boundOutputIds = contentBlockIds.filter(
    (blockId) => execution.outputs[blockId] !== undefined,
  );
  const lastBlockId = contentBlockIds[contentBlockIds.length - 1] ?? "";
  const isExecutionActive =
    execution.status === "running" || execution.status === "stopping";
  const canStartExecution = !isExecutionActive;
  const canStopExecution = execution.status === "running";

  const getStatusLabel = (status: ExecutionStatus, message: string | null) => {
    switch (status) {
      case "running":
        return "Execution running";
      case "stopping":
        return "Stopping execution";
      case "timeout":
        return message ? `Execution timed out: ${message}` : "Execution timed out";
      case "canceled":
        return message ? `Execution canceled: ${message}` : "Execution canceled";
      case "error":
        return message ? `Execution failed: ${message}` : "Execution failed";
      default:
        return "Execution idle";
    }
  };

  const executionMessage = getStatusLabel(
    execution.status,
    execution.error?.message ?? null,
  );

  const getBlockExecutionState = (blockId: string) => {
    const isRunning = execution.runningBlockIds.includes(blockId);
    const isTarget = execution.targetBlockId === blockId;

    return {
      isRunning,
      isTarget,
      executionOrder: execution.executionOrderByBlockId[blockId] ?? null,
      canRun: canStartExecution,
      canRunFromHere: canStartExecution,
      canStop: canStopExecution && (isRunning || isTarget),
    };
  };

  const getOutputs = (blockId: string): OutputItem[] | undefined =>
    execution.outputs[blockId];

  const requestSync = async () => {
    dirtyDuringSyncRef.current = false;
    setSyncMeta((m) => ({ ...m, status: "syncing" }));
    const next = await syncNotebook(notebookRef.current, {
      ...syncMetaRef.current,
      status: "syncing",
    });
    // If the user edited the notebook while the sync was in flight, the local
    // copy diverges from what was pushed: downgrade "synced" to "unsynced".
    const resolved =
      next.status === "synced" && dirtyDuringSyncRef.current
        ? { ...next, status: "unsynced" as const }
        : next;
    setSyncMeta(resolved);
    await repositoryRef.current.save(notebookRef.current, resolved);
  };

  const replaceLocalWithServer = async () => {
    if (!syncMeta.serverId) {
      return;
    }
    const server = await fetchServerVersion(syncMeta.serverId, notebook.id);
    const next = adoptServerVersion(
      syncMeta,
      server.revision,
      new Date().toISOString(),
    );
    editedSinceLoadRef.current = false;
    setNotebook(server);
    setSyncMeta(next);
    await repositoryRef.current.save(server, next);
  };

  const keepLocalForLater = () => setSyncMeta((m) => ({ ...m, status: "unsynced" }));

  const selectBlock = (blockId: string | null) => {
    useAppStore.setState((state) => ({
      ...state,
      blockUi: {
        ...state.blockUi,
        selectedBlockId: blockId,
      },
    }));
  };

  const deleteNotebook = async () => {
    const confirmed =
      globalThis.confirm?.(`Delete notebook "${notebookRef.current.title}"?`) ?? true;
    if (!confirmed || deletePending) {
      return;
    }

    setDeletePending(true);
    setDeleteError(null);

    try {
      if (syncMetaRef.current.serverId) {
        await deleteServerNotebook(syncMetaRef.current.serverId);
      }
      await repositoryRef.current.remove(notebookRef.current.id);
      removeNotebookListItem(notebookRef.current.id, syncMetaRef.current.serverId);
      autosaverRef.current.cancel();
      notebookWorkerBridge.dispose();
      disposeExecutionSession();
      useAppStore.setState((state) => ({
        ...state,
        blockUi: {
          selectedBlockId: null,
          focusedBlockId: null,
          toolbarOpenForBlockId: null,
          aiPromptOpenForBlockId: null,
        },
      }));
      navigateRef.current("/notebooks");
    } catch {
      setDeleteError(`Failed to delete "${notebookRef.current.title}".`);
    } finally {
      setDeletePending(false);
    }
  };

  const renameNotebookTitle = async (title: string) => {
    const nextTitle = normalizeNotebookTitle(title);
    const currentNotebook = notebookRef.current;

    if (nextTitle === currentNotebook.title) {
      return;
    }

    if (syncMetaRef.current.serverId === null) {
      applyNotebookChange((activeNotebook) => ({
        ...activeNotebook,
        title: nextTitle,
      }));
      updateNotebookListItemTitle(currentNotebook.id, null, nextTitle);
      return;
    }

    const server = await patchNotebookTitleOnServer(
      syncMetaRef.current.serverId,
      nextTitle,
    );
    const nextNotebook = applyServerNotebookMetadata(notebookRef.current, server);
    setNotebook(nextNotebook);
    updateNotebookListItemTitle(
      nextNotebook.id,
      syncMetaRef.current.serverId,
      nextNotebook.title,
    );
    await persistNotebook(nextNotebook);
  };

  return {
    notebookId,
    notebook,
    actions,
    contentBlockIds,
    boundOutputIds,
    lastBlockId,
    executionStatus: execution.status,
    executionMessage,
    executionError: execution.error,
    activeExecutionId: execution.activeExecutionId,
    activeCommand: execution.activeCommand,
    activeTargetBlockId: execution.targetBlockId,
    selectedBlockId,
    selectBlock,
    canStartExecution,
    canStopExecution,
    getBlockExecutionState,
    getOutputs,
    syncStatus: syncMeta.status,
    syncMeta,
    canDeleteNotebook: !deletePending && syncMeta.status !== "syncing",
    deletePending,
    deleteError,
    deleteNotebook,
    canRenameTitle: syncMeta.status !== "syncing",
    renameNotebookTitle,
    requestSync,
    replaceLocalWithServer,
    keepLocalForLater,
  };
}
