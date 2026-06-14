import { describe, expect, it } from "vitest";
import { testUser } from "@test/authFixtures";
import { initialExecutionState } from "@/features/execution";
import { useAppStore } from "./store";
import { AUTH_STORAGE_KEY } from "./persist";

describe("auth persist", () => {
  it("persists user summary to localStorage", () => {
    useAppStore.getState().setAuthUser(testUser("user@example.com"));
    const raw = globalThis.localStorage.getItem(AUTH_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as {
      state: { auth: { user: { email: string } } };
    };
    expect(parsed.state.auth.user.email).toBe("user@example.com");
  });

  it("does not trust persisted auth until session is confirmed", () => {
    useAppStore.getState().logout();
    globalThis.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          auth: {
            isAuthenticated: true,
            user: testUser("back@example.com"),
            authenticatedAt: "2026-05-14T10:00:00Z",
          },
        },
      }),
    );
    useAppStore.persist.rehydrate();
    const auth = useAppStore.getState().auth;
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.status).toBe("checking");
  });

  it("clears the authenticated flag on logout", () => {
    useAppStore.getState().setAuthUser(testUser());
    useAppStore.getState().logout();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
    expect(useAppStore.getState().auth.user).toBeNull();
  });

  it("does not persist execution outputs across rehydrate", () => {
    globalThis.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          auth: {
            isAuthenticated: true,
            user: testUser("persisted@example.com"),
            authenticatedAt: "2026-05-14T10:00:00Z",
          },
          execution: {
            status: "error",
            outputs: {
              blk_1: [{ type: "text", payload: "should not restore" }],
            },
          },
        },
      }),
    );

    useAppStore.setState({
      execution: {
        status: "error",
        activeExecutionId: "exec_memory",
        activeCommand: "run-current",
        targetBlockId: "blk_memory",
        runningBlockIds: [],
        outputs: {
          blk_memory: [{ type: "text", payload: "memory output" }],
        },
        error: {
          kind: "runtime",
          message: "memory error",
        },
      },
    });

    // Simulate a fresh reload where execution starts from initial in-memory state.
    useAppStore.setState({
      execution: initialExecutionState,
    });

    useAppStore.persist.rehydrate();

    const execution = useAppStore.getState().execution;
    expect(execution.status).toBe("idle");
    expect(execution.activeExecutionId).toBeNull();
    expect(execution.activeCommand).toBeNull();
    expect(execution.targetBlockId).toBeNull();
    expect(execution.runningBlockIds).toEqual([]);
    expect(execution.outputs).toEqual({});
    expect(execution.error).toBeNull();
  });
});
