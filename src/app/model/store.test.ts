import { describe, it, expect } from "vitest";
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

  it("AuthSlice actions are wired (logout resets auth)", () => {
    useAppStore.getState().setAuthenticated(true, "x@y.z");
    useAppStore.getState().logout();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
  });
});
