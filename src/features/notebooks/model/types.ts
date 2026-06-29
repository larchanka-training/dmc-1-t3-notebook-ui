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
  removeNotebookListItem: (localId: string | null, serverId: string | null) => void;
  updateNotebookListItemTitle: (
    localId: string,
    serverId: string | null,
    title: string,
  ) => void;
  createNotebook: (title?: string) => NotebookListItem;
}
