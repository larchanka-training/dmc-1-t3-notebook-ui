import { describe, it, expect, beforeEach } from "vitest";
import { create, type StateCreator } from "zustand";
import { createAuthSlice } from "./auth";
import type { AuthSlice } from "../types";

const makeStore = () =>
  create<AuthSlice>()(createAuthSlice as unknown as StateCreator<AuthSlice>);

describe("createAuthSlice", () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it("initial state is unauthenticated, idle, no error", () => {
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(false);
    expect(s.auth.userEmail).toBeNull();
    expect(s.auth.status).toBe("idle");
    expect(s.auth.error).toBeNull();
  });

  it("setAuthenticated(true, email) flips auth state", () => {
    store.getState().setAuthenticated(true, "user@example.com");
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(true);
    expect(s.auth.userEmail).toBe("user@example.com");
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
    store.getState().setAuthenticated(true, "user@example.com");
    store.getState().logout();
    const s = store.getState();
    expect(s.auth.isAuthenticated).toBe(false);
    expect(s.auth.userEmail).toBeNull();
    expect(s.auth.status).toBe("idle");
  });
});
