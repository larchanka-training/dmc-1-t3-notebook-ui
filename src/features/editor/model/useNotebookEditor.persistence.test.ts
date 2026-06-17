import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createInMemoryStore } from "@/shared/persistence";
import {
  createNotebookRepository,
  sampleNotebook,
  type NotebookRepository,
  type Notebook,
} from "@/entities/notebook";
import { useNotebookEditor, NOTEBOOK_AUTOSAVE_DELAY_MS } from "./useNotebookEditor";

function makeRepo(): NotebookRepository {
  return createNotebookRepository(createInMemoryStore());
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useNotebookEditor persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores a persisted notebook instead of the route mock", async () => {
    const repository = makeRepo();
    const stored: Notebook = {
      ...sampleNotebook,
      id: "nb_restore",
      title: "Restored from IndexedDB",
    };
    await repository.save(stored);

    const { result } = renderHook(() =>
      useNotebookEditor("nb_restore", { repository }),
    );
    await flushEffects();

    expect(result.current.notebook.title).toBe("Restored from IndexedDB");
  });

  it("autosaves edits after the debounce delay", async () => {
    const repository = makeRepo();
    const { result } = renderHook(() =>
      useNotebookEditor(sampleNotebook.id, { repository }),
    );
    await flushEffects();

    const codeBlock = result.current.notebook.blocks.find(
      (block) => block.type === "code",
    )!;
    act(() => {
      result.current.actions.updateCode(codeBlock.id, "const persisted = 1;");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(NOTEBOOK_AUTOSAVE_DELAY_MS);
    });

    const loaded = await repository.load(sampleNotebook.id);
    const saved = loaded?.blocks.find((block) => block.id === codeBlock.id);
    expect(saved && saved.type === "code" ? saved.content.source : "").toBe(
      "const persisted = 1;",
    );
  });

  it("does not autosave the seed notebook before any edit", async () => {
    const repository = makeRepo();
    const saveSpy = vi.spyOn(repository, "save");

    renderHook(() => useNotebookEditor("nb_fresh", { repository }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(NOTEBOOK_AUTOSAVE_DELAY_MS);
    });

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
