import type { StateCreator } from "zustand";
import type { AppState, ActiveNotebookSlice } from "../types";

export const createActiveNotebookSlice: StateCreator<
  AppState,
  [],
  [],
  ActiveNotebookSlice
> = () => ({
  activeNotebook: {
    notebookId: null,
    blocks: [],
    dirty: false
  }
});
