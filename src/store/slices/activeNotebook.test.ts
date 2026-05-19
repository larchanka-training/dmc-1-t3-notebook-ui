import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createActiveNotebookSlice } from "./activeNotebook";
import type { ActiveNotebookSlice } from "../types";

describe("createActiveNotebookSlice", () => {
  it("initial state has no active notebook", () => {
    const store = create<ActiveNotebookSlice>()(
      createActiveNotebookSlice as unknown as StateCreator<ActiveNotebookSlice>
    );
    const s = store.getState();
    expect(s.activeNotebook.notebookId).toBeNull();
    expect(s.activeNotebook.blocks).toEqual([]);
    expect(s.activeNotebook.dirty).toBe(false);
  });
});
