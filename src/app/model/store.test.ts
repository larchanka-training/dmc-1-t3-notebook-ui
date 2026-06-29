import { describe, it, expect } from "vitest";
import { testUser } from "@test/authFixtures";
import { useAppStore } from "./store";

describe("useAppStore", () => {
  it("exposes all 7 slice namespaces", () => {
    const s = useAppStore.getState();
    expect(s.auth).toBeDefined();
    expect(s.notebookList).toBeDefined();
    expect(s.activeNotebook).toBeDefined();
    expect(s.blockUi).toBeDefined();
    expect(s.execution).toBeDefined();
    expect(s.sync).toBeDefined();
    expect(s.appUi).toBeDefined();
  });

  it("logout resets auth and notebook-related slices", () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        user: testUser("x@y.z"),
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
      notebookList: {
        items: [
          {
            id: "nb_1",
            serverId: null,
            title: "Draft",
            updatedAt: "2026-05-18T10:00:00.000Z",
            origin: "local-only",
          },
        ],
        status: "idle",
        error: null,
      },
      activeNotebook: { notebookId: "nb_1", blocks: [], dirty: true },
      execution: {
        status: "running",
        activeExecutionId: "exec_1",
        activeCommand: "run-current",
        targetBlockId: "blk_1",
        runningBlockIds: ["blk_1"],
        executionOrderByBlockId: {},
        nextExecutionOrder: 1,
        outputs: {
          blk_1: [{ type: "text", payload: "hello" }],
        },
        error: {
          kind: "runtime",
          message: "boom",
        },
      },
    });

    useAppStore.getState().logout();

    const state = useAppStore.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.notebookList.items).toHaveLength(0);
    expect(state.activeNotebook.notebookId).toBeNull();
    expect(state.activeNotebook.dirty).toBe(false);
    expect(state.execution.status).toBe("idle");
    expect(state.execution.activeExecutionId).toBeNull();
    expect(state.execution.activeCommand).toBeNull();
    expect(state.execution.targetBlockId).toBeNull();
    expect(state.execution.runningBlockIds).toEqual([]);
    expect(state.execution.executionOrderByBlockId).toEqual({});
    expect(state.execution.nextExecutionOrder).toBe(1);
    expect(state.execution.outputs).toEqual({});
    expect(state.execution.error).toBeNull();
  });
});
