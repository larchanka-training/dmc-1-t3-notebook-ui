import { useState } from "react";
import type { Notebook } from "@/entities/notebook";
import { fetchServerVersion } from "@/features/sync";
import { useNotebookEditor } from "../model/useNotebookEditor";
import type { NotebookBlockRender } from "../model/types";
import { NotebookBlockView } from "./NotebookBlockView";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";
import { SyncConflictPanel } from "./SyncConflictPanel";

type NotebookEditorViewProps = {
  notebookId: string | null;
  renderBlockActionSupplement?: NotebookBlockRender;
};

export function NotebookEditorView({
  notebookId,
  renderBlockActionSupplement,
}: NotebookEditorViewProps) {
  const {
    notebook,
    actions,
    contentBlockIds,
    boundOutputIds,
    lastBlockId,
    executionStatus,
    executionMessage,
    canStartExecution,
    canStopExecution,
    getBlockExecutionState,
    getOutputs,
    syncStatus,
    syncMeta,
    requestSync,
    replaceLocalWithServer,
    keepLocalForLater,
  } = useNotebookEditor(notebookId);

  const [serverPreview, setServerPreview] = useState<Notebook | null>(null);

  const reviewServerVersion = async () => {
    if (!syncMeta.serverId) {
      return;
    }
    setServerPreview(await fetchServerVersion(syncMeta.serverId, notebook.id));
  };

  return (
    <div className="min-h-full bg-app text-ink">
      <NotebookEditorToolbar
        notebook={notebook}
        lastBlockId={lastBlockId}
        actions={actions}
        executionMessage={executionMessage}
        executionStatus={executionStatus}
        canStartExecution={canStartExecution}
        canStopExecution={canStopExecution}
        syncStatus={syncStatus}
        onSync={requestSync}
      />

      {syncStatus === "conflict" ? (
        <SyncConflictPanel
          baseRevision={syncMeta.baseRevision}
          serverRevision={syncMeta.serverRevision}
          onReview={reviewServerVersion}
          onReplace={replaceLocalWithServer}
          onKeepLocal={keepLocalForLater}
          onRetry={requestSync}
        />
      ) : null}

      {serverPreview ? (
        <section
          className="mx-auto mt-2 w-full max-w-5xl rounded-md border border-border-token bg-surface px-token-24 py-token-12 text-sm max-md:px-3.5"
          aria-label="Server version preview"
        >
          <p className="font-semibold text-ink">Server version (read-only)</p>
          <p className="mt-1 text-ink-muted">
            {serverPreview.title} · revision {serverPreview.revision} ·{" "}
            {serverPreview.blocks.length} blocks.
          </p>
        </section>
      ) : null}

      <section
        className="mx-auto w-full max-w-5xl px-6 py-8 pb-6 max-md:px-3.5"
        aria-labelledby="notebook-title"
      >
        <p className="mb-2 text-[0.8125rem] font-semibold text-ink-muted">
          Notebook editor template
        </p>
        <h1
          id="notebook-title"
          className="max-w-2xl text-3xl font-semibold leading-tight"
        >
          {notebook.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-muted">
          Notebook {notebookId ?? "unknown"} · ordered blocks: {contentBlockIds.length}.
          Output bindings: {boundOutputIds.length}. Revision {notebook.revision}.
        </p>
      </section>

      <section
        className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-8 max-md:px-3.5"
        aria-label="Notebook blocks"
      >
        {notebook.blocks.map((block, index) => (
          <NotebookBlockView
            key={block.id}
            block={block}
            index={index}
            blockCount={notebook.blocks.length}
            outputs={getOutputs(block.id)}
            actions={actions}
            executionState={getBlockExecutionState(block.id)}
            actionSupplement={renderBlockActionSupplement?.({
              notebook,
              syncMeta,
              block,
              index,
              blockCount: notebook.blocks.length,
              actions,
            })}
          />
        ))}
      </section>
    </div>
  );
}
