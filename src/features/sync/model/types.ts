export interface SyncSlice {
  sync: {
    lastSyncedAt: string | null;
    status: "idle" | "in-progress" | "success" | "conflict" | "error";
    error: string | null;
  };
}
