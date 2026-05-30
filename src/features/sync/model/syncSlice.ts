import type { StateCreator } from "zustand";
import type { SyncSlice } from "./types";

export const createSyncSlice: StateCreator<SyncSlice, [], [], SyncSlice> = () => ({
  sync: {
    lastSyncedAt: null,
    status: "idle",
    error: null,
  },
});
