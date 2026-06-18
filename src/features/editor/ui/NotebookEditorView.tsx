import { useNotebookEditor } from "../model/useNotebookEditor";
import type { NotebookBlockRender } from "../model/types";
import { NotebookBlockView } from "./NotebookBlockView";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";

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
  } = useNotebookEditor(notebookId);

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
      />

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
