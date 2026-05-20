import type { AuthSlice } from "@/features/auth";
import type { ActiveNotebookSlice, BlockUiSlice } from "@/features/editor";
import type { ExecutionSlice } from "@/features/execution";
import type { NotebookListSlice } from "@/features/notebooks";
import type { SyncSlice } from "@/features/sync";

export interface AppUiSlice {
  appUi: {
    globalLoading: boolean;
    toast: { id: string; level: "info" | "error"; message: string } | null;
  };
  showToast: (message: string, level?: "info" | "error") => void;
  dismissToast: () => void;
}

export type AppState = AuthSlice &
  NotebookListSlice &
  ActiveNotebookSlice &
  BlockUiSlice &
  ExecutionSlice &
  SyncSlice &
  AppUiSlice;
