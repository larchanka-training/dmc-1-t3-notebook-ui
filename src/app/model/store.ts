import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";
import { createAuthSlice } from "@/features/auth";
import { createNotebookListSlice } from "@/features/notebooks";
import { createActiveNotebookSlice, createBlockUiSlice } from "@/features/editor";
import { createExecutionSlice } from "@/features/execution";
import { createSyncSlice } from "@/features/sync";
import { createAppUiSlice } from "./appUiSlice";
import { authPersistOptions } from "./persist";
import type { AppState } from "./types";

const createRootState: StateCreator<
  AppState,
  [["zustand/persist", unknown]],
  [],
  AppState
> = (...args) => {
  const [set] = args;
  const slices = {
    ...createAuthSlice(...args),
    ...createNotebookListSlice(...args),
    ...createActiveNotebookSlice(...args),
    ...createBlockUiSlice(...args),
    ...createExecutionSlice(...args),
    ...createSyncSlice(...args),
    ...createAppUiSlice(...args),
  };

  return {
    ...slices,
    logout: () => {
      set({
        auth: {
          isAuthenticated: false,
          userEmail: null,
          status: "idle",
          error: null,
        },
        notebookList: { items: [], status: "idle", error: null },
        activeNotebook: { notebookId: null, blocks: [], dirty: false },
        blockUi: {
          selectedBlockId: null,
          focusedBlockId: null,
          toolbarOpenForBlockId: null,
          aiPromptOpenForBlockId: null,
        },
        execution: {
          status: "idle",
          targetBlockId: null,
          runningBlockIds: [],
          outputs: {},
          error: null,
        },
        sync: { lastSyncedAt: null, status: "idle", error: null },
      });
    },
  };
};

export const useAppStore = create<AppState>()(
  persist(createRootState, authPersistOptions),
);
