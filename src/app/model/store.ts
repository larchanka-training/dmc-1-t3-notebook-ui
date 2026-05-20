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
> = (...args) => ({
  ...createAuthSlice(...args),
  ...createNotebookListSlice(...args),
  ...createActiveNotebookSlice(...args),
  ...createBlockUiSlice(...args),
  ...createExecutionSlice(...args),
  ...createSyncSlice(...args),
  ...createAppUiSlice(...args),
});

export const useAppStore = create<AppState>()(
  persist(createRootState, authPersistOptions),
);
