import type { NotebookListItem } from "./mergeNotebookList";

export type { NotebookListItem } from "./mergeNotebookList";

export type NotebookListStatus = "idle" | "loading" | "error";

export interface NotebookListSlice {
  notebookList: {
    items: NotebookListItem[];
    status: NotebookListStatus;
    error: string | null;
  };
  setNotebookList: (items: NotebookListItem[]) => void;
  setNotebookListStatus: (status: NotebookListStatus, error?: string | null) => void;
  createNotebook: (title?: string) => NotebookListItem;
}
