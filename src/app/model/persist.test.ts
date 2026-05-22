import { describe, expect, it } from "vitest";
import { testUser } from "@test/authFixtures";
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

  it("rehydrates user summary from localStorage", () => {
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
    expect(useAppStore.getState().auth.user?.email).toBe("back@example.com");
    expect(useAppStore.getState().auth.authenticatedAt).toBe("2026-05-14T10:00:00Z");
  });

  it("migrates legacy userEmail field to user on rehydrate", () => {
    useAppStore.getState().logout();
    globalThis.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          auth: { isAuthenticated: true, userEmail: "legacy@example.com" },
        },
      }),
    );
    useAppStore.persist.rehydrate();
    expect(useAppStore.getState().auth.user?.email).toBe("legacy@example.com");
  });

  it("clears the authenticated flag on logout", () => {
    useAppStore.getState().setAuthUser(testUser());
    useAppStore.getState().logout();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
    expect(useAppStore.getState().auth.user).toBeNull();
  });
});
