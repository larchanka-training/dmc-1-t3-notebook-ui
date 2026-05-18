import type { StateCreator } from "zustand";
import type { AppState, NotebookListSlice } from "../types";

export const createNotebookListSlice: StateCreator<
  AppState,
  [],
  [],
  NotebookListSlice
> = () => ({
  notebookList: {
    items: [],
    status: "idle",
    error: null
  }
});
