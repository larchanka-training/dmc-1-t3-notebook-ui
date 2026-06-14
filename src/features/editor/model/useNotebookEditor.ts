import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/app/model";
import {
  type CodeBlock,
  createCodeBlock,
  createTextBlock,
  deleteBlock,
  insertBlockAfter,
  insertBlockBefore,
  moveBlock,
  notebookContentBlockIds,
  updateCodeBlockSource,
  updateTextBlockMarkdown,
} from "@/entities/notebook";
import type { NotebookBlock } from "@/entities/notebook";
import { sampleNotebook } from "@/entities/notebook";
import type { OutputItem } from "@/entities/output";
import { notebookWorkerBridge, toRuntimeExecutionRequest } from "@/features/execution";
import type { ExecutionStatus } from "@/features/execution";
import type { BlockActions } from "./types";

function notebookForRoute(notebookId: string | null) {
  if (!notebookId) {
    return sampleNotebook;
  }

  return {
    ...sampleNotebook,
    id: notebookId,
    title:
      notebookId === sampleNotebook.id
        ? sampleNotebook.title
        : `Notebook ${notebookId}`,
  };
}

export function useNotebookEditor(notebookId: string | null) {
  const [notebook, setNotebook] = useState(() => notebookForRoute(notebookId));
  const [nextBlockNumber, setNextBlockNumber] = useState(1);
  const nextExecutionNumberRef = useRef(1);
  const execution = useAppStore((state) => state.execution);
  const startExecution = useAppStore((state) => state.startExecution);
  const markBlockRunning = useAppStore((state) => state.markBlockRunning);
  const clearBlockOutputsForRun = useAppStore((state) => state.clearBlockOutputsForRun);
  const appendBlockOutput = useAppStore((state) => state.appendBlockOutput);
  const completeBlockExecution = useAppStore((state) => state.completeBlockExecution);
  const recordExecutionError = useAppStore((state) => state.recordExecutionError);
  const disposeExecutionSession = useAppStore((state) => state.disposeExecutionSession);
  const markExecutionStopping = useAppStore((state) => state.markExecutionStopping);

  useEffect(() => {
    setNotebook(notebookForRoute(notebookId));
    setNextBlockNumber(1);
    nextExecutionNumberRef.current = 1;
    // Dispose worker bridge (side effect) before resetting slice state.
    notebookWorkerBridge.dispose();
    disposeExecutionSession();
  }, [disposeExecutionSession, notebookId]);

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

    setNotebook((currentNotebook) => ({
      ...currentNotebook,
      blocks: insert(currentNotebook.blocks, blockId, newBlock),
    }));
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
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: deleteBlock(currentNotebook.blocks, blockId),
      }));
    },
    moveBlockById: (blockId, direction) => {
      setNotebook((currentNotebook) => ({
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
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateTextBlockMarkdown(currentNotebook.blocks, blockId, markdown),
      }));
    },
    updateCode: (blockId, source) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateCodeBlockSource(currentNotebook.blocks, blockId, source),
      }));
    },
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
      canRun: canStartExecution,
      canRunFromHere: canStartExecution,
      canStop: canStopExecution && (isRunning || isTarget),
    };
  };

  const getOutputs = (blockId: string): OutputItem[] | undefined =>
    execution.outputs[blockId];

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
    canStartExecution,
    canStopExecution,
    getBlockExecutionState,
    getOutputs,
  };
}
