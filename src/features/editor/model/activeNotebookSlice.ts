import type { StateCreator } from "zustand";
import type { ActiveNotebookSlice } from "./sliceTypes";

export const createActiveNotebookSlice: StateCreator<
  ActiveNotebookSlice,
  [],
  [],
  ActiveNotebookSlice
> = () => ({
  activeNotebook: {
    notebookId: null,
    blocks: [],
    dirty: false,
  },
});
