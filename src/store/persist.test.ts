import { describe, it, expect } from "vitest";
import { useAppStore } from "./index";

const KEY = "js-notebook-auth";

describe("auth persistence", () => {
  it("writes only the auth slice to localStorage on sign-in", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    const raw = globalThis.localStorage.getItem(KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.auth.isAuthenticated).toBe(true);
    expect(parsed.state.auth.userEmail).toBe("user@example.com");
    expect(parsed.state.notebookList).toBeUndefined();
    expect(parsed.state.activeNotebook).toBeUndefined();
  });

  it("rehydrates isAuthenticated from localStorage", () => {
    globalThis.localStorage.setItem(
      KEY,
      JSON.stringify({
        state: { auth: { isAuthenticated: true, userEmail: "back@example.com" } },
        version: 0
      })
    );
    useAppStore.persist.rehydrate();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
    expect(useAppStore.getState().auth.userEmail).toBe("back@example.com");
    expect(useAppStore.getState().auth.status).toBe("idle");
  });

  it("clears the authenticated flag on logout", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    useAppStore.getState().logout();
    const parsed = JSON.parse(globalThis.localStorage.getItem(KEY) as string);
    expect(parsed.state.auth.isAuthenticated).toBe(false);
  });
});
