import { describe, it, expect, beforeEach } from "vitest";
import { create, type StateCreator } from "zustand";
import { testUser } from "@test/authFixtures";
import { createAuthSlice } from "./authSlice";
import type { AuthSlice } from "./types";

const makeStore = () =>
  create<AuthSlice>()(createAuthSlice as unknown as StateCreator<AuthSlice>);

describe("createAuthSlice", () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it("initial state is unauthenticated, idle, no user", () => {
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(false);
    expect(s.auth.user).toBeNull();
    expect(s.auth.authenticatedAt).toBeNull();
    expect(s.auth.status).toBe("idle");
    expect(s.auth.error).toBeNull();
  });

  it("setAuthUser stores full user summary and authenticatedAt", () => {
    store.getState().setAuthUser(testUser(), "2026-05-14T10:00:00Z");
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(true);
    expect(s.auth.user).toEqual(testUser());
    expect(s.auth.authenticatedAt).toBe("2026-05-14T10:00:00Z");
  });

  it("setAuthStatus updates status and error", () => {
    store.getState().setAuthStatus("error", "OTP expired");
    const s = store.getState();
    expect(s.auth.status).toBe("error");
    expect(s.auth.error).toBe("OTP expired");
  });

  it("setAuthStatus without error clears error", () => {
    store.getState().setAuthStatus("error", "fail");
    store.getState().setAuthStatus("idle");
    expect(store.getState().auth.error).toBeNull();
  });

  it("logout resets to initial state", () => {
    store.getState().setAuthUser(testUser());
    store.getState().logout();
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(false);
    expect(s.auth.user).toBeNull();
    expect(s.auth.authenticatedAt).toBeNull();
    expect(s.auth.status).toBe("idle");
  });
});
