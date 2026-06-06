import { createJSONStorage } from "zustand/middleware";
import { initialAuthState } from "@/features/auth/@x/app";
import type { AppState } from "./types";

export const AUTH_STORAGE_KEY = "js-notebook-auth";

export const authPersistOptions = {
  name: AUTH_STORAGE_KEY,
  storage: createJSONStorage(() => globalThis.localStorage),
  partialize: (state: AppState) => ({
    auth: {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user,
      authenticatedAt: state.auth.authenticatedAt,
    },
  }),
  merge: (_persisted: unknown, current: AppState) => ({
    ...current,
    auth: initialAuthState,
  }),
};
