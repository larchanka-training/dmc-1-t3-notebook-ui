import { useEffect, useState } from "react";
import { Braces, FileText, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Notebook } from "@/entities/notebook";
import { fetchServerVersion } from "@/features/sync";
import { Button } from "@/shared/ui";
import { useNotebookEditor } from "../model/useNotebookEditor";
import type { NotebookBlockRender, NotebookTopBarRender } from "../model/types";
import { InsertBlockDivider } from "./InsertBlockDivider";
import { NotebookBlockView } from "./NotebookBlockView";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";
import { SyncConflictPanel } from "./SyncConflictPanel";
import { NotebookTitleEditor } from "./NotebookTitleEditor";

type NotebookEditorViewProps = {
  notebookId: string | null;
  renderBlockActionSupplement?: NotebookBlockRender;
  renderTopBarStatusSupplement?: NotebookTopBarRender;
};

export function NotebookEditorView({
  notebookId,
  renderBlockActionSupplement,
  renderTopBarStatusSupplement,
}: NotebookEditorViewProps) {
  const navigate = useNavigate();
  const {
    notebook,
    actions,
    contentBlockIds,
    boundOutputIds,
    lastBlockId,
    executionStatus,
    executionMessage,
    selectedBlockId,
    selectBlock,
    canStartExecution,
    canStopExecution,
    getBlockExecutionState,
    getOutputs,
    syncStatus,
    syncMeta,
    canDeleteNotebook,
    deletePending,
    deleteError,
    deleteNotebook,
    canRenameTitle,
    renameNotebookTitle,
    requestSync,
    replaceLocalWithServer,
    keepLocalForLater,
  } = useNotebookEditor(notebookId, { navigate });

  const [serverPreview, setServerPreview] = useState<Notebook | null>(null);

  useEffect(() => {
    const firstBlockId = notebook.blocks[0]?.id ?? null;

    if (
      !selectedBlockId ||
      !notebook.blocks.some((block) => block.id === selectedBlockId)
    ) {
      selectBlock(firstBlockId);
    }
  }, [notebook.blocks, selectBlock, selectedBlockId]);

  const reviewServerVersion = async () => {
    if (!syncMeta.serverId) {
      return;
    }
    setServerPreview(await fetchServerVersion(syncMeta.serverId, notebook.id));
  };

  const insertFirstBlock = (type: "text" | "code") => {
    actions.addBlockAfter("", type);
  };

  return (
    <div className="min-h-full bg-app text-ink">
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
          className="mx-auto mt-3 w-full max-w-5xl rounded-2xl border border-border-token bg-surface px-token-24 py-token-12 text-sm shadow-[0_8px_24px_rgba(64,50,29,0.05)] max-md:px-3.5"
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
        className="mx-auto w-full max-w-5xl px-6 py-8 pb-2 max-md:px-3.5"
        aria-label="Notebook header"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <NotebookTitleEditor
              title={notebook.title}
              canRename={canRenameTitle}
              onRename={renameNotebookTitle}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-1 h-9 w-9 shrink-0 text-ink-muted hover:text-accent-danger"
            disabled={!canDeleteNotebook}
            aria-label="Delete notebook from editor"
            title="Delete notebook"
            onClick={() => {
              void deleteNotebook();
            }}
          >
            {deletePending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
          </Button>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted">
          {contentBlockIds.length} blocks, {boundOutputIds.length} output bindings,
          revision {notebook.revision}.
        </p>
        {deleteError ? (
          <p className="mt-2 text-sm text-accent-danger" role="alert">
            {deleteError}
          </p>
        ) : null}
      </section>

      <section
        className="mx-auto w-full max-w-5xl px-6 pb-4 max-md:px-3.5"
        aria-label="Notebook top bar"
      >
        <NotebookEditorToolbar
          lastBlockId={lastBlockId}
          actions={actions}
          executionMessage={executionMessage}
          executionStatus={executionStatus}
          canStartExecution={canStartExecution}
          canStopExecution={canStopExecution}
          syncStatus={syncStatus}
          onSync={requestSync}
          statusSupplement={renderTopBarStatusSupplement?.({
            notebook,
            syncMeta,
            actions,
          })}
        />
      </section>

      <section
        className="mx-auto grid w-full max-w-5xl gap-0 px-6 pb-8 max-md:px-3.5"
        aria-label="Notebook blocks"
      >
        {notebook.blocks.length === 0 ? (
          <section
            className="rounded-[28px] border border-dashed border-border-token bg-surface px-6 py-10 text-center shadow-[0_8px_24px_rgba(64,50,29,0.05)]"
            aria-label="Empty notebook"
          >
            <h2 className="text-lg font-semibold text-ink">
              Start this notebook with your first block
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-ink-muted">
              Create a text block for notes or a code block for executable JavaScript.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => insertFirstBlock("text")}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Insert text block
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => insertFirstBlock("code")}
              >
                <Braces className="h-4 w-4" aria-hidden="true" />
                Insert code block
              </Button>
            </div>
          </section>
        ) : (
          <>
            <InsertBlockDivider
              previousBlockId={null}
              nextBlockId={notebook.blocks[0]?.id ?? null}
              actions={actions}
            />
            {notebook.blocks.map((block, index) => (
              <div key={`${notebook.id}:${block.id}`}>
                <NotebookBlockView
                  block={block}
                  index={index}
                  blockCount={notebook.blocks.length}
                  isSelected={selectedBlockId === block.id}
                  outputs={getOutputs(block.id)}
                  actions={actions}
                  executionState={getBlockExecutionState(block.id)}
                  onSelect={selectBlock}
                  actionSupplement={renderBlockActionSupplement?.({
                    notebook,
                    syncMeta,
                    block,
                    index,
                    blockCount: notebook.blocks.length,
                    actions,
                  })}
                />
                <InsertBlockDivider
                  previousBlockId={block.id}
                  nextBlockId={notebook.blocks[index + 1]?.id ?? null}
                  actions={actions}
                />
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
