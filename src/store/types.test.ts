import { describe, it, expectTypeOf } from "vitest";
import type {
  AuthSlice,
  NotebookListSlice,
  ActiveNotebookSlice,
  BlockUiSlice,
  ExecutionSlice,
  SyncSlice,
  AppUiSlice,
  AppState
} from "./types";

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
