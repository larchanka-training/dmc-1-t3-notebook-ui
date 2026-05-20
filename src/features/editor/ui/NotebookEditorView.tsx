import { useNotebookEditor } from "../model/useNotebookEditor";
import { NotebookBlockView } from "./NotebookBlockView";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";

type NotebookEditorViewProps = {
  notebookId: string | null;
};

export function NotebookEditorView({ notebookId }: NotebookEditorViewProps) {
  const { notebook, actions, contentBlockIds, boundOutputIds, lastBlockId, getOutput } =
    useNotebookEditor(notebookId);

  return (
    <div className="min-h-full bg-app text-ink">
      <NotebookEditorToolbar
        notebook={notebook}
        lastBlockId={lastBlockId}
        actions={actions}
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
            output={getOutput(block.id)}
            actions={actions}
          />
        ))}
      </section>
    </div>
  );
}
