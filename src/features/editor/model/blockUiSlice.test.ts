import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createBlockUiSlice } from "./blockUiSlice";
import type { BlockUiSlice } from "./sliceTypes";

describe("createBlockUiSlice", () => {
  it("initial state has nothing selected", () => {
    const store = create<BlockUiSlice>()(
      createBlockUiSlice as unknown as StateCreator<BlockUiSlice>,
    );
    const s = store.getState();
    expect(s.blockUi.selectedBlockId).toBeNull();
    expect(s.blockUi.focusedBlockId).toBeNull();
    expect(s.blockUi.toolbarOpenForBlockId).toBeNull();
    expect(s.blockUi.aiPromptOpenForBlockId).toBeNull();
  });
});
