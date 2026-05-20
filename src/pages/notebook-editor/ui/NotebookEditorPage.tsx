import { NotebookEditorView } from "@/features/editor";
import { useNotebookEditorPage } from "../model/useNotebookEditorPage";

export function NotebookEditorPage() {
  const { notebookId } = useNotebookEditorPage();

  return <NotebookEditorView notebookId={notebookId} />;
}
