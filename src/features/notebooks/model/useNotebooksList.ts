import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";

export function useNotebooksList() {
  const { items, status, error } = useAppStore((s) => s.notebookList);
  const createNotebook = useAppStore((s) => s.createNotebook);
  const navigate = useNavigate();

  function onCreateNotebook() {
    const notebook = createNotebook();
    navigate(`/notebooks/${notebook.id}`);
  }

  return {
    items,
    status,
    error,
    onCreateNotebook,
  };
}
