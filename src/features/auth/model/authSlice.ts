import type { StateCreator } from "zustand";
import type { AuthSlice } from "./types";

const initialAuth: AuthSlice["auth"] = {
  isAuthenticated: false,
  userEmail: null,
  status: "idle",
  error: null,
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  auth: initialAuth,
  setAuthenticated: (authed, email) =>
    set((s) => ({
      auth: {
        ...s.auth,
        isAuthenticated: authed,
        userEmail: authed ? (email ?? s.auth.userEmail) : null,
      },
    })),
  setAuthStatus: (status, error = null) =>
    set((s) => ({ auth: { ...s.auth, status, error } })),
  logout: () => set({ auth: initialAuth }),
});
