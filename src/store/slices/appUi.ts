import type { StateCreator } from "zustand";
import type { AppState, AppUiSlice } from "../types";

export const createAppUiSlice: StateCreator<AppState, [], [], AppUiSlice> =
  () => ({
    appUi: {
      globalLoading: false,
      toast: null
    }
  });
