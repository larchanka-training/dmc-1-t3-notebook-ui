import { createJSONStorage } from "zustand/middleware";
import type { AppState } from "./types";

export const AUTH_STORAGE_KEY = "js-notebook-auth";

export const authPersistOptions = {
  name: AUTH_STORAGE_KEY,
  storage: createJSONStorage(() => globalThis.localStorage),
  partialize: (state: AppState) => ({
    auth: {
      isAuthenticated: state.auth.isAuthenticated,
      userEmail: state.auth.userEmail,
    },
  }),
  merge: (persisted: unknown, current: AppState) => {
    const stored = persisted as
      | { auth?: { isAuthenticated?: boolean; userEmail?: string | null } }
      | undefined;

    return {
      ...current,
      auth: { ...current.auth, ...(stored?.auth ?? {}) },
    };
  },
};
