import type { StateCreator } from "zustand";
import type { AuthSlice } from "./types";

export const initialAuthState: AuthSlice["auth"] = {
  isAuthenticated: false,
  user: null,
  authenticatedAt: null,
  status: "idle",
  error: null,
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  auth: initialAuthState,
  setAuthUser: (user, authenticatedAt = null) =>
    set((s) => ({
      auth: {
        ...s.auth,
        isAuthenticated: user !== null,
        user,
        authenticatedAt: user ? (authenticatedAt ?? s.auth.authenticatedAt) : null,
        error: user ? null : s.auth.error,
      },
    })),
  setAuthStatus: (status, error = null) =>
    set((s) => ({ auth: { ...s.auth, status, error } })),
  logout: () => set({ auth: initialAuthState }),
});
