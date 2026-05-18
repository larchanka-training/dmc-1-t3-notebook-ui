import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";
import type { AppState } from "./types";
import { createAuthSlice } from "./slices/auth";
import { createNotebookListSlice } from "./slices/notebookList";
import { createActiveNotebookSlice } from "./slices/activeNotebook";
import { createBlockUiSlice } from "./slices/blockUi";
import { createExecutionSlice } from "./slices/execution";
import { createSyncSlice } from "./slices/sync";
import { createAppUiSlice } from "./slices/appUi";

export const useAppStore = create<AppState>()(
  persist(
    ((...a) => ({
      ...createAuthSlice(...a),
      ...createNotebookListSlice(...a),
      ...createActiveNotebookSlice(...a),
      ...createBlockUiSlice(...a),
      ...createExecutionSlice(...a),
      ...createSyncSlice(...a),
      ...createAppUiSlice(...a)
    })) as StateCreator<AppState, [["zustand/persist", unknown]], [], AppState>,
    {
      name: "js-notebook-auth",
      storage: createJSONStorage(() => globalThis.localStorage),
      partialize: (s) => ({
        auth: {
          isAuthenticated: s.auth.isAuthenticated,
          userEmail: s.auth.userEmail
        }
      }),
      merge: (persisted, current) => {
        const p = persisted as
          | { auth?: { isAuthenticated?: boolean; userEmail?: string | null } }
          | undefined;
        return {
          ...current,
          auth: { ...current.auth, ...(p?.auth ?? {}) }
        };
      }
    }
  )
);

export type { AppState } from "./types";
