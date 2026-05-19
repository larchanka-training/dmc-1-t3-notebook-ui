import type { StateCreator } from "zustand";
import type { AppState, NotebookListSlice } from "../types";

export const createNotebookListSlice: StateCreator<
  AppState,
  [],
  [],
  NotebookListSlice
> = (set) => ({
  notebookList: {
    items: [],
    status: "idle",
    error: null
  },
  createNotebook: (title = "Untitled notebook") => {
    const notebook: NotebookListSlice["notebookList"]["items"][number] = {
      id: `local-${Date.now().toString(36)}`,
      title,
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      notebookList: {
        ...state.notebookList,
        items: [notebook, ...state.notebookList.items]
      }
    }));

    return notebook;
  }
});
