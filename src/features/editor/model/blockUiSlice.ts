import type { StateCreator } from "zustand";
import type { BlockUiSlice } from "./sliceTypes";

export const createBlockUiSlice: StateCreator<
  BlockUiSlice,
  [],
  [],
  BlockUiSlice
> = () => ({
  blockUi: {
    selectedBlockId: null,
    focusedBlockId: null,
    toolbarOpenForBlockId: null,
    aiPromptOpenForBlockId: null,
  },
});
