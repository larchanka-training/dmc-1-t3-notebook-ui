import { BlockAiAction } from "@/features/ai";
import { NotebookEditorView } from "@/features/editor";
import { useNotebookEditorPage } from "../model/useNotebookEditorPage";

export function NotebookEditorPage() {
  const { notebookId } = useNotebookEditorPage();

  return (
    <NotebookEditorView
      notebookId={notebookId}
      renderBlockActionSupplement={({ notebook, block, actions }) =>
        block.type === "text" ? (
          <BlockAiAction
            notebookId={notebook.id}
            notebookTitle={notebook.title}
            blocks={notebook.blocks}
            block={block}
            onInsertCode={actions.applyGeneratedCode}
          />
        ) : null
      }
    />
  );
}
