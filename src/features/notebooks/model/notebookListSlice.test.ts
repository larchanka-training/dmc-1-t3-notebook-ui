import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createNotebookListSlice } from "./notebookListSlice";
import type { NotebookListSlice } from "./types";

describe("createNotebookListSlice", () => {
  it("initial state is empty list, idle status", () => {
    const store = create<NotebookListSlice>()(
      createNotebookListSlice as unknown as StateCreator<NotebookListSlice>,
    );
    const s = store.getState();
    expect(s.notebookList.items).toEqual([]);
    expect(s.notebookList.status).toBe("idle");
    expect(s.notebookList.error).toBeNull();
  });

  it("removes matching items by local id or server id", () => {
    const store = create<NotebookListSlice>()(
      createNotebookListSlice as unknown as StateCreator<NotebookListSlice>,
    );

    store.getState().setNotebookList([
      {
        id: "local-1",
        serverId: null,
        title: "Local",
        updatedAt: "2026-06-28T00:00:00.000Z",
        origin: "local-only",
      },
      {
        id: "local-2",
        serverId: "srv-2",
        title: "Synced",
        updatedAt: "2026-06-28T00:00:00.000Z",
        origin: "synced",
      },
      {
        id: null,
        serverId: "srv-3",
        title: "Remote",
        updatedAt: "2026-06-28T00:00:00.000Z",
        origin: "remote-only",
      },
    ]);

    store.getState().removeNotebookListItem("local-1", null);
    expect(store.getState().notebookList.items.map((item) => item.title)).toEqual([
      "Synced",
      "Remote",
    ]);

    store.getState().removeNotebookListItem(null, "srv-3");
    expect(store.getState().notebookList.items.map((item) => item.title)).toEqual([
      "Synced",
    ]);
  });
});
