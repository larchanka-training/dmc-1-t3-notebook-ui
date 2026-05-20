import type { StateCreator } from "zustand";
import type { ExecutionSlice } from "./types";

export const createExecutionSlice: StateCreator<
  ExecutionSlice,
  [],
  [],
  ExecutionSlice
> = () => ({
  execution: {
    status: "idle",
    targetBlockId: null,
    runningBlockIds: [],
    outputs: {},
    error: null,
  },
});
