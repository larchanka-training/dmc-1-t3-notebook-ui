import type { StateCreator } from "zustand";
import type { NotebookListItem, NotebookListSlice } from "./types";

export const createNotebookListSlice: StateCreator<
  NotebookListSlice,
  [],
  [],
  NotebookListSlice
> = (set) => ({
  notebookList: {
    items: [],
    status: "idle",
    error: null,
  },
  setNotebookList: (items) =>
    set((state) => ({
      notebookList: { ...state.notebookList, items },
    })),
  setNotebookListStatus: (status, error = null) =>
    set((state) => ({
      notebookList: { ...state.notebookList, status, error },
    })),
  createNotebook: (title = "Untitled notebook") => {
    const notebook: NotebookListItem = {
      id: `local-${Date.now().toString(36)}`,
      serverId: null,
      title,
      updatedAt: new Date().toISOString(),
      origin: "local-only",
    };

    set((state) => ({
      notebookList: {
        ...state.notebookList,
        items: [notebook, ...state.notebookList.items],
      },
    }));

    return notebook;
  },
});
