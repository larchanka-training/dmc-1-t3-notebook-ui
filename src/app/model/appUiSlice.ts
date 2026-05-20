import type { StateCreator } from "zustand";
import type { AppUiSlice } from "./types";

export const createAppUiSlice: StateCreator<AppUiSlice, [], [], AppUiSlice> = (
  set,
) => ({
  appUi: {
    globalLoading: false,
    toast: null,
  },
  showToast: (message, level = "info") =>
    set({
      appUi: {
        globalLoading: false,
        toast: { id: crypto.randomUUID(), level, message },
      },
    }),
  dismissToast: () =>
    set((state) => ({
      appUi: { ...state.appUi, toast: null },
    })),
});
