import type { StateCreator } from "zustand";
import type { AppState, SyncSlice } from "../types";

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> =
  () => ({
    sync: {
      lastSyncedAt: null,
      status: "idle",
      error: null
    }
  });
