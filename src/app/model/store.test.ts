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
        items: [{ id: "nb_1", title: "Draft", updatedAt: "2026-05-18T10:00:00.000Z" }],
        status: "idle",
        error: null,
      },
      activeNotebook: { notebookId: "nb_1", blocks: [], dirty: true },
    });

    useAppStore.getState().logout();

    const state = useAppStore.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.notebookList.items).toHaveLength(0);
    expect(state.activeNotebook.notebookId).toBeNull();
    expect(state.activeNotebook.dirty).toBe(false);
  });
});
