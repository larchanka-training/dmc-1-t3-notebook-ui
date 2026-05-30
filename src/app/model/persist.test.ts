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
});
