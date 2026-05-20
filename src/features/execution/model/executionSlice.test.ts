import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createExecutionSlice } from "./executionSlice";
import type { ExecutionSlice } from "./types";

describe("createExecutionSlice", () => {
  it("initial state is idle with no outputs", () => {
    const store = create<ExecutionSlice>()(
      createExecutionSlice as unknown as StateCreator<ExecutionSlice>,
    );
    const s = store.getState();
    expect(s.execution.status).toBe("idle");
    expect(s.execution.targetBlockId).toBeNull();
    expect(s.execution.runningBlockIds).toEqual([]);
    expect(s.execution.outputs).toEqual({});
    expect(s.execution.error).toBeNull();
  });
});
