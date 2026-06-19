import { describe, it, expect } from "vitest";
import { createInMemoryStore } from "@/shared/persistence";
import { createNotebookRepository } from "./notebookRepository";
import { DEFAULT_SYNC_META } from "./persistedNotebook";
import type { PersistedNotebookRecord } from "./persistedNotebook";
import type { Notebook } from "../model/types";

const notebook: Notebook = {
  id: "nb_1",
  title: "Test",
  revision: 1,
  createdAt: "2026-06-15T10:00:00.000Z",
  updatedAt: "2026-06-15T10:00:00.000Z",
  blocks: [{ id: "blk_t", type: "text", content: { markdown: "# Hi" } }],
};

const makeRepo = () =>
  createNotebookRepository(createInMemoryStore<PersistedNotebookRecord>());

describe("notebook repository", () => {
  it("saves a notebook with default sync meta and loads both back", async () => {
    const repo = makeRepo();
    await repo.save(notebook);

    const stored = await repo.load("nb_1");
    expect(stored?.notebook.id).toBe("nb_1");
    expect(stored?.sync).toEqual(DEFAULT_SYNC_META);
  });

  it("persists provided sync meta", async () => {
    const repo = makeRepo();
    await repo.save(notebook, {
      ...DEFAULT_SYNC_META,
      serverId: "srv-1",
      baseRevision: 3,
      status: "synced",
    });

    const stored = await repo.load("nb_1");
    expect(stored?.sync.serverId).toBe("srv-1");
    expect(stored?.sync.baseRevision).toBe(3);
    expect(stored?.sync.status).toBe("synced");
  });

  it("returns undefined for a missing notebook", async () => {
    expect(await makeRepo().load("nope")).toBeUndefined();
  });

  it("lists all stored notebooks with their sync meta", async () => {
    const repo = makeRepo();
    await repo.save(notebook);
    await repo.save({ ...notebook, id: "nb_2" });
    const all = await repo.loadAll();
    expect(all.map((s) => s.notebook.id).sort()).toEqual(["nb_1", "nb_2"]);
  });

  it("removes a notebook", async () => {
    const repo = makeRepo();
    await repo.save(notebook);
    await repo.remove("nb_1");
    expect(await repo.load("nb_1")).toBeUndefined();
  });
});
