import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createInMemoryStore } from "@/shared/persistence";
import {
  createNotebookRepository,
  sampleNotebook,
  type NotebookRepository,
} from "@/entities/notebook";
import * as engine from "@/features/sync";
import { useNotebookEditor } from "./useNotebookEditor";

const makeRepo = (): NotebookRepository =>
  createNotebookRepository(createInMemoryStore());

const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("useNotebookEditor sync", () => {
  it("exposes sync status from the loaded record (default unsynced)", async () => {
    const repository = makeRepo();
    const { result } = renderHook(() =>
      useNotebookEditor(sampleNotebook.id, { repository }),
    );
    await flush();
    expect(result.current.syncStatus).toBe("unsynced");
  });

  it("requestSync runs the engine and stores returned meta", async () => {
    const repository = makeRepo();
    const spy = vi.spyOn(engine, "syncNotebook").mockResolvedValue({
      serverId: "srv-1",
      baseRevision: 1,
      status: "synced",
      serverRevision: null,
      lastSyncedAt: "2026-06-18T11:00:00.000Z",
      lastError: null,
    });

    const { result } = renderHook(() =>
      useNotebookEditor(sampleNotebook.id, { repository }),
    );
    await flush();
    await act(async () => {
      await result.current.requestSync();
    });

    expect(spy).toHaveBeenCalledOnce();
    expect(result.current.syncStatus).toBe("synced");
    const stored = await repository.load(sampleNotebook.id);
    expect(stored?.sync.serverId).toBe("srv-1");
  });

  it("edit during in-flight sync leaves status unsynced and keeps the latest content", async () => {
    const repository = makeRepo();
    let resolveSync!: (meta: Awaited<ReturnType<typeof engine.syncNotebook>>) => void;
    vi.spyOn(engine, "syncNotebook").mockReturnValue(
      new Promise((resolve) => {
        resolveSync = resolve;
      }),
    );

    const { result } = renderHook(() =>
      useNotebookEditor(sampleNotebook.id, { repository }),
    );
    await flush();

    // Start the sync but do not await it yet.
    let syncPromise!: Promise<void>;
    act(() => {
      syncPromise = result.current.requestSync();
    });

    // Edit while the sync is in flight.
    const editedMarkdown = "# Edited mid-flight";
    act(() => {
      result.current.actions.updateText("blk_intro", editedMarkdown);
    });

    // Resolve the in-flight sync with a successful (synced) meta.
    await act(async () => {
      resolveSync({
        serverId: "srv-2",
        baseRevision: 1,
        status: "synced",
        serverRevision: null,
        lastSyncedAt: "2026-06-18T11:00:00.000Z",
        lastError: null,
      });
      await syncPromise;
    });
    await flush();

    expect(result.current.syncStatus).toBe("unsynced");

    const stored = await repository.load(sampleNotebook.id);
    const introBlock = stored?.notebook.blocks.find(
      (block) => block.id === "blk_intro",
    );
    expect(introBlock?.type).toBe("text");
    expect(introBlock?.type === "text" ? introBlock.content.markdown : null).toBe(
      editedMarkdown,
    );
  });
});
