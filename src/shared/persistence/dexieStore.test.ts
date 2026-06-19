import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { createDexieStore } from "./dexieStore";

type Rec = { schemaVersion: number; notebook: { id: string; title: string } };

const rec = (id: string, title: string): Rec => ({
  schemaVersion: 0,
  notebook: { id, title },
});

describe("dexie key-value store", () => {
  it("persists a value and reads it back by id", async () => {
    const store = createDexieStore<Rec>("kv-test-read", "records");
    await store.put("nb_1", rec("nb_1", "Alpha"));

    const got = await store.get("nb_1");
    expect(got?.notebook.title).toBe("Alpha");
  });

  it("returns undefined for a missing id", async () => {
    const store = createDexieStore<Rec>("kv-test-missing", "records");
    expect(await store.get("nope")).toBeUndefined();
  });

  it("overwrites an existing value (upsert) without duplicating", async () => {
    const store = createDexieStore<Rec>("kv-test-upsert", "records");
    await store.put("nb_1", rec("nb_1", "First"));
    await store.put("nb_1", rec("nb_1", "Second"));

    expect((await store.get("nb_1"))?.notebook.title).toBe("Second");
    expect(await store.getAll()).toHaveLength(1);
  });

  it("lists all stored values", async () => {
    const store = createDexieStore<Rec>("kv-test-all", "records");
    await store.put("nb_1", rec("nb_1", "A"));
    await store.put("nb_2", rec("nb_2", "B"));

    const all = await store.getAll();
    expect(all.map((r) => r.notebook.id).sort()).toEqual(["nb_1", "nb_2"]);
  });

  it("deletes a value", async () => {
    const store = createDexieStore<Rec>("kv-test-delete", "records");
    await store.put("nb_1", rec("nb_1", "A"));
    await store.delete("nb_1");

    expect(await store.get("nb_1")).toBeUndefined();
  });

  it("persists across a fresh store instance on the same database", async () => {
    const first = createDexieStore<Rec>("kv-test-reopen", "records");
    await first.put("nb_1", rec("nb_1", "Durable"));

    const reopened = createDexieStore<Rec>("kv-test-reopen", "records");
    expect((await reopened.get("nb_1"))?.notebook.title).toBe("Durable");
  });
});
