import { createJSONStorage } from "zustand/middleware";
import { userSummaryFromPersisted } from "@/entities/user";
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
  merge: (persisted: unknown, current: AppState) => {
    const stored = persisted as
      | {
          auth?: {
            isAuthenticated?: boolean;
            user?: AppState["auth"]["user"];
            userEmail?: string | null;
            authenticatedAt?: string | null;
          };
        }
      | undefined;

    const user = userSummaryFromPersisted(stored?.auth);
    const isAuthenticated = stored?.auth?.isAuthenticated ?? false;

    return {
      ...current,
      auth: {
        ...current.auth,
        isAuthenticated: isAuthenticated && user !== null,
        user: isAuthenticated ? user : null,
        authenticatedAt: stored?.auth?.authenticatedAt ?? null,
      },
    };
  },
};
