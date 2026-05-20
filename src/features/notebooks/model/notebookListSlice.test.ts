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
});
