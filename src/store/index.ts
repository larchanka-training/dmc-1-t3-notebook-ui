import { create } from "zustand";
import type { AppState } from "./types";
import { createAuthSlice } from "./slices/auth";
import { createNotebookListSlice } from "./slices/notebookList";
import { createActiveNotebookSlice } from "./slices/activeNotebook";
import { createBlockUiSlice } from "./slices/blockUi";
import { createExecutionSlice } from "./slices/execution";
import { createSyncSlice } from "./slices/sync";
import { createAppUiSlice } from "./slices/appUi";

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createNotebookListSlice(...a),
  ...createActiveNotebookSlice(...a),
  ...createBlockUiSlice(...a),
  ...createExecutionSlice(...a),
  ...createSyncSlice(...a),
  ...createAppUiSlice(...a)
}));

export type { AppState } from "./types";
