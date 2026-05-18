export interface AuthSlice {
  auth: {
    isAuthenticated: boolean;
    userEmail: string | null;
    status: "idle" | "requestingOtp" | "verifyingOtp" | "error";
    error: string | null;
  };
  setAuthenticated: (authed: boolean, email?: string) => void;
  setAuthStatus: (
    status: AuthSlice["auth"]["status"],
    error?: string | null
  ) => void;
  logout: () => void;
}

export interface NotebookListSlice {
  notebookList: {
    items: NotebookSummary[];
    status: "idle" | "loading" | "error";
    error: string | null;
  };
}

export interface ActiveNotebookSlice {
  activeNotebook: {
    notebookId: string | null;
    blocks: NotebookBlock[];
    dirty: boolean;
  };
}

export interface BlockUiSlice {
  blockUi: {
    selectedBlockId: string | null;
    focusedBlockId: string | null;
    toolbarOpenForBlockId: string | null;
    aiPromptOpenForBlockId: string | null;
  };
}

export interface ExecutionSlice {
  execution: {
    status: "idle" | "running" | "stopping";
    targetBlockId: string | null;
    runningBlockIds: string[];
    outputs: Record<string, BlockOutput>;
    error: string | null;
  };
}

export interface SyncSlice {
  sync: {
    lastSyncedAt: string | null;
    status: "idle" | "in-progress" | "success" | "conflict" | "error";
    error: string | null;
  };
}

export interface AppUiSlice {
  appUi: {
    globalLoading: boolean;
    toast: { id: string; level: "info" | "error"; message: string } | null;
  };
}

export interface NotebookSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface NotebookBlock {
  id: string;
  type: "text" | "code";
  content: string;
  order: number;
}

export type BlockOutput =
  | { type: "text"; payload: string }
  | { type: "object"; payload: unknown }
  | { type: "table"; payload: { columns: string[]; rows: unknown[][] } }
  | { type: "chart"; payload: unknown }
  | { type: "error"; payload: { message: string; stack?: string } };

export type AppState = AuthSlice &
  NotebookListSlice &
  ActiveNotebookSlice &
  BlockUiSlice &
  ExecutionSlice &
  SyncSlice &
  AppUiSlice;
