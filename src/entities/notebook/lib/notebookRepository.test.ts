import { describe, it, expect } from "vitest";
import { createInMemoryStore } from "@/shared/persistence";
import { createNotebookRepository } from "./notebookRepository";
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

function makeRepo() {
  return createNotebookRepository(createInMemoryStore<PersistedNotebookRecord>());
}

describe("notebook repository", () => {
  it("saves and loads a notebook by id", async () => {
    const repo = makeRepo();
    await repo.save(notebook);

    const loaded = await repo.load("nb_1");
    expect(loaded?.id).toBe("nb_1");
    expect(loaded?.tags).toEqual([]);
  });

  it("returns undefined for a missing notebook", async () => {
    const repo = makeRepo();
    expect(await repo.load("nope")).toBeUndefined();
  });

  it("lists all saved notebooks", async () => {
    const repo = makeRepo();
    await repo.save(notebook);
    await repo.save({ ...notebook, id: "nb_2" });

    const all = await repo.loadAll();
    expect(all.map((n) => n.id).sort()).toEqual(["nb_1", "nb_2"]);
  });

  it("overwrites an existing notebook on re-save (upsert)", async () => {
    const repo = makeRepo();
    await repo.save(notebook);
    await repo.save({ ...notebook, title: "Renamed" });

    expect((await repo.load("nb_1"))?.title).toBe("Renamed");
    expect(await repo.loadAll()).toHaveLength(1);
  });

  it("removes a notebook", async () => {
    const repo = makeRepo();
    await repo.save(notebook);
    await repo.remove("nb_1");

    expect(await repo.load("nb_1")).toBeUndefined();
  });

  it("preserves block-level tags through save/load", async () => {
    const repo = makeRepo();
    await repo.save({
      ...notebook,
      blocks: [
        {
          id: "blk_t",
          type: "text",
          content: { markdown: "x" },
          meta: { tags: ["keep"] },
        },
      ],
    });

    const loaded = await repo.load("nb_1");
    expect(loaded?.blocks[0].meta?.tags).toEqual(["keep"]);
  });
});
