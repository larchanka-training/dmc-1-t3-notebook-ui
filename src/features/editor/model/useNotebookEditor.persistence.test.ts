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
    const saved = loaded?.notebook.blocks.find((block) => block.id === codeBlock.id);
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

  it("reuses the next empty code block for AI-generated code insertion", async () => {
    const repository = makeRepo();
    const sourceNotebook: Notebook = {
      ...sampleNotebook,
      id: "nb_ai_reuse",
      blocks: [
        sampleNotebook.blocks[0],
        sampleNotebook.blocks[1],
        sampleNotebook.blocks[2],
        {
          id: "blk_empty_code",
          type: "code",
          content: {
            language: "javascript",
            source: "",
          },
        },
        sampleNotebook.blocks[3],
      ],
    };
    await repository.save(sourceNotebook);

    const { result } = renderHook(() =>
      useNotebookEditor(sourceNotebook.id, { repository }),
    );
    await flushEffects();

    act(() => {
      result.current.actions.applyGeneratedCode(
        "blk_observation",
        "const average = total / orders.length;",
      );
    });

    const codeBlocks = result.current.notebook.blocks.filter(
      (block) => block.type === "code",
    );
    expect(codeBlocks).toHaveLength(3);
    const reusedBlock = result.current.notebook.blocks.find(
      (block) => block.id === "blk_empty_code",
    );
    expect(
      reusedBlock && reusedBlock.type === "code" ? reusedBlock.content.source : "",
    ).toBe("const average = total / orders.length;");
  });

  it("creates a new code block after the source text block when reuse is not possible", async () => {
    const repository = makeRepo();
    const { result } = renderHook(() =>
      useNotebookEditor(sampleNotebook.id, { repository }),
    );
    await flushEffects();

    act(() => {
      result.current.actions.applyGeneratedCode(
        "blk_intro",
        "function summarizeOrders(orders) { return orders.length; }",
      );
    });

    expect(result.current.notebook.blocks[1]).toMatchObject({
      id: "blk_new_code_1",
      type: "code",
      content: {
        language: "javascript",
        source: "function summarizeOrders(orders) { return orders.length; }",
      },
    });
  });
});
