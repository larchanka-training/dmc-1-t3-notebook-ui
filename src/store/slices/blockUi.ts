import type { StateCreator } from "zustand";
import type { AppState, BlockUiSlice } from "../types";

export const createBlockUiSlice: StateCreator<
  AppState,
  [],
  [],
  BlockUiSlice
> = () => ({
  blockUi: {
    selectedBlockId: null,
    focusedBlockId: null,
    toolbarOpenForBlockId: null,
    aiPromptOpenForBlockId: null
  }
});
