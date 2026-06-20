import { describe, it, expectTypeOf } from "vitest";
import type { AuthSlice } from "@/features/auth/@x/app";
import type { ActiveNotebookSlice, BlockUiSlice } from "@/features/editor";
import type { ExecutionSlice } from "@/features/execution";
import type { NotebookListSlice } from "@/features/notebooks";
import type { SyncSlice } from "@/features/sync";
import type { AppState, AppUiSlice } from "@/app/model/types";

describe("store types", () => {
  it("AppState composes all 7 slices", () => {
    expectTypeOf<AppState>().toHaveProperty("auth");
    expectTypeOf<AppState>().toHaveProperty("notebookList");
    expectTypeOf<AppState>().toHaveProperty("activeNotebook");
    expectTypeOf<AppState>().toHaveProperty("blockUi");
    expectTypeOf<AppState>().toHaveProperty("execution");
    expectTypeOf<AppState>().toHaveProperty("sync");
    expectTypeOf<AppState>().toHaveProperty("appUi");
  });

  it("slice types are non-empty", () => {
    expectTypeOf<AuthSlice>().not.toBeAny();
    expectTypeOf<NotebookListSlice>().not.toBeAny();
    expectTypeOf<ActiveNotebookSlice>().not.toBeAny();
    expectTypeOf<BlockUiSlice>().not.toBeAny();
    expectTypeOf<ExecutionSlice>().not.toBeAny();
    expectTypeOf<SyncSlice>().not.toBeAny();
    expectTypeOf<AppUiSlice>().not.toBeAny();
  });
});
