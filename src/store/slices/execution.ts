import type { StateCreator } from "zustand";
import type { AppState, ExecutionSlice } from "../types";

export const createExecutionSlice: StateCreator<
  AppState,
  [],
  [],
  ExecutionSlice
> = () => ({
  execution: {
    status: "idle",
    targetBlockId: null,
    runningBlockIds: [],
    outputs: {},
    error: null
  }
});
