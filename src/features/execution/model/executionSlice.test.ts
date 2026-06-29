import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createExecutionSlice } from "./executionSlice";
import type { ExecutionSlice } from "./types";

describe("createExecutionSlice", () => {
  const createExecutionStore = () =>
    create<ExecutionSlice>()(
      createExecutionSlice as unknown as StateCreator<ExecutionSlice>,
    );

  it("initial state is idle with no outputs", () => {
    const store = createExecutionStore();
    const s = store.getState();
    expect(s.execution.status).toBe("idle");
    expect(s.execution.activeExecutionId).toBeNull();
    expect(s.execution.activeCommand).toBeNull();
    expect(s.execution.targetBlockId).toBeNull();
    expect(s.execution.runningBlockIds).toEqual([]);
    expect(s.execution.executionOrderByBlockId).toEqual({});
    expect(s.execution.nextExecutionOrder).toBe(1);
    expect(s.execution.outputs).toEqual({});
    expect(s.execution.error).toBeNull();
  });

  it("starts a run-current execution and binds its target metadata", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });

    const s = store.getState();
    expect(s.execution.status).toBe("running");
    expect(s.execution.activeExecutionId).toBe("exec_1");
    expect(s.execution.activeCommand).toBe("run-current");
    expect(s.execution.targetBlockId).toBe("blk_1");
    expect(s.execution.outputs).toEqual({});
  });

  it("replaces latest-run outputs for a block before appending new messages", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().appendBlockOutput("exec_1", "blk_1", {
      type: "text",
      payload: "old output",
    });
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().appendBlockOutput("exec_1", "blk_1", {
      type: "text",
      payload: "fresh output",
    });

    expect(store.getState().execution.outputs).toEqual({
      blk_1: [{ type: "text", payload: "fresh output" }],
    });
  });

  it("keeps an empty array to mark a latest run that has started but has no outputs yet", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");

    expect(store.getState().execution.outputs).toEqual({
      blk_1: [],
    });
  });

  it("assigns an execution order after a successful run", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().markBlockRunning("exec_1", "blk_1");
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().completeBlockExecution("exec_1", "blk_1");

    const s = store.getState();
    expect(s.execution.status).toBe("idle");
    expect(s.execution.runningBlockIds).toEqual([]);
    expect(s.execution.executionOrderByBlockId).toEqual({ blk_1: 1 });
    expect(s.execution.nextExecutionOrder).toBe(2);
  });

  it("reassigns a new execution order when the block is rerun", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().markBlockRunning("exec_1", "blk_1");
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().completeBlockExecution("exec_1", "blk_1");

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_2",
      targetBlockId: "blk_1",
    });
    store.getState().clearBlockOutputsForRun("exec_2", "blk_1");
    store.getState().markBlockRunning("exec_2", "blk_1");
    store.getState().completeBlockExecution("exec_2", "blk_1");

    expect(store.getState().execution.executionOrderByBlockId).toEqual({
      blk_1: 2,
    });
    expect(store.getState().execution.nextExecutionOrder).toBe(3);
  });

  it("preserves execution order across run-current and resets it on run-all", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().markBlockRunning("exec_1", "blk_1");
    store.getState().completeBlockExecution("exec_1", "blk_1");

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_2",
      targetBlockId: "blk_2",
    });
    store.getState().markBlockRunning("exec_2", "blk_2");
    store.getState().completeBlockExecution("exec_2", "blk_2");

    expect(store.getState().execution.executionOrderByBlockId).toEqual({
      blk_1: 1,
      blk_2: 2,
    });

    store.getState().startExecution({
      command: "run-all",
      executionId: "exec_3",
      targetBlockId: "blk_1",
    });

    expect(store.getState().execution.executionOrderByBlockId).toEqual({});
    expect(store.getState().execution.nextExecutionOrder).toBe(1);
  });

  it("ignores stale outputs and errors from a previous execution id", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_2",
      targetBlockId: "blk_2",
    });
    store.getState().clearBlockOutputsForRun("exec_2", "blk_2");
    store.getState().appendBlockOutput("exec_1", "blk_2", {
      type: "text",
      payload: "stale output",
    });
    store.getState().recordExecutionError("exec_1", {
      kind: "runtime",
      message: "stale error",
    });

    const s = store.getState();
    expect(s.execution.outputs).toEqual({ blk_2: [] });
    expect(s.execution.error).toBeNull();
    expect(s.execution.status).toBe("running");
  });

  it("records a block-scoped error output and marks timeout status", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().markBlockRunning("exec_1", "blk_1");
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().recordExecutionError(
      "exec_1",
      {
        kind: "timeout",
        name: "TimeoutError",
        message: "Execution timed out",
      },
      "blk_1",
    );

    const s = store.getState();
    expect(s.execution.status).toBe("timeout");
    expect(s.execution.runningBlockIds).toEqual([]);
    expect(s.execution.executionOrderByBlockId).toEqual({});
    expect(s.execution.nextExecutionOrder).toBe(1);
    expect(s.execution.error).toEqual({
      kind: "timeout",
      name: "TimeoutError",
      message: "Execution timed out",
    });
    expect(s.execution.outputs.blk_1).toEqual([
      {
        type: "error",
        payload: {
          name: "TimeoutError",
          message: "Execution timed out",
          stack: undefined,
        },
      },
    ]);
  });

  it("resets execution state back to the initial shape", () => {
    const store = createExecutionStore();

    store.getState().startExecution({
      command: "run-current",
      executionId: "exec_1",
      targetBlockId: "blk_1",
    });
    store.getState().markBlockRunning("exec_1", "blk_1");
    store.getState().clearBlockOutputsForRun("exec_1", "blk_1");
    store.getState().appendBlockOutput("exec_1", "blk_1", {
      type: "text",
      payload: "hello",
    });
    store.getState().resetExecutionState();

    const s = store.getState();
    expect(s.execution.status).toBe("idle");
    expect(s.execution.activeExecutionId).toBeNull();
    expect(s.execution.activeCommand).toBeNull();
    expect(s.execution.targetBlockId).toBeNull();
    expect(s.execution.runningBlockIds).toEqual([]);
    expect(s.execution.executionOrderByBlockId).toEqual({});
    expect(s.execution.nextExecutionOrder).toBe(1);
    expect(s.execution.outputs).toEqual({});
    expect(s.execution.error).toBeNull();
  });
});
