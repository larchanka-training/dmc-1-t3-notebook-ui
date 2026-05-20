export interface NotebookSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface NotebookListSlice {
  notebookList: {
    items: NotebookSummary[];
    status: "idle" | "loading" | "error";
    error: string | null;
  };
  createNotebook: (title?: string) => NotebookSummary;
}
