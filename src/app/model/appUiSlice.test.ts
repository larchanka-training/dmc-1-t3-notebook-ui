import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createAppUiSlice } from "./appUiSlice";
import type { AppUiSlice } from "@/app/model/types";

describe("createAppUiSlice", () => {
  it("initial state has no global loading, no toast", () => {
    const store = create<AppUiSlice>()(
      createAppUiSlice as unknown as StateCreator<AppUiSlice>,
    );
    const s = store.getState();
    expect(s.appUi.globalLoading).toBe(false);
    expect(s.appUi.toast).toBeNull();
  });

  it("showToast and dismissToast update toast state", () => {
    const store = create<AppUiSlice>()(
      createAppUiSlice as unknown as StateCreator<AppUiSlice>,
    );

    store.getState().showToast("Saved", "info");
    expect(store.getState().appUi.toast?.message).toBe("Saved");

    store.getState().dismissToast();
    expect(store.getState().appUi.toast).toBeNull();
  });
});
