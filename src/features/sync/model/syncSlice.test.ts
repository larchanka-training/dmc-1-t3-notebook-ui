import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createSyncSlice } from "./syncSlice";
import type { SyncSlice } from "./types";

describe("createSyncSlice", () => {
  it("initial state is idle, never synced", () => {
    const store = create<SyncSlice>()(
      createSyncSlice as unknown as StateCreator<SyncSlice>,
    );
    const s = store.getState();
    expect(s.sync.lastSyncedAt).toBeNull();
    expect(s.sync.status).toBe("idle");
    expect(s.sync.error).toBeNull();
  });
});
