import { describe, it, expect } from "vitest";
import { create, type StateCreator } from "zustand";
import { createAppUiSlice } from "./appUi";
import type { AppUiSlice } from "../types";

describe("createAppUiSlice", () => {
  it("initial state has no global loading, no toast", () => {
    const store = create<AppUiSlice>()(
      createAppUiSlice as unknown as StateCreator<AppUiSlice>
    );
    const s = store.getState();
    expect(s.appUi.globalLoading).toBe(false);
    expect(s.appUi.toast).toBeNull();
  });
});
