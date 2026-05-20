import { useParams } from "react-router-dom";

export function useNotebookEditorPage() {
  const { notebookId } = useParams<{ notebookId: string }>();

  return { notebookId: notebookId ?? null };
}
