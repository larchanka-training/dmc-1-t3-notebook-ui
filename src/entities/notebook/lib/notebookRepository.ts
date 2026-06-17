import type { KeyValueStore } from "@/shared/persistence";
import type { Notebook } from "../model/types";
import {
  fromPersistedRecord,
  toPersistedRecord,
  type PersistedNotebookRecord,
} from "./persistedNotebook";

/** Local notebook persistence: save/load whole notebooks by id. No endpoints. */
export interface NotebookRepository {
  save(notebook: Notebook): Promise<void>;
  load(id: string): Promise<Notebook | undefined>;
  loadAll(): Promise<Notebook[]>;
  remove(id: string): Promise<void>;
}

/**
 * Build a notebook repository over any {@link KeyValueStore}. Wraps notebooks in
 * versioned persisted records on the way in and migrates/normalizes on the way
 * out, so callers always work with plain {@link Notebook} objects.
 */
export function createNotebookRepository(
  store: KeyValueStore<PersistedNotebookRecord>,
): NotebookRepository {
  return {
    async save(notebook) {
      await store.put(notebook.id, toPersistedRecord(notebook));
    },
    async load(id) {
      const record = await store.get(id);
      return record ? fromPersistedRecord(record) : undefined;
    },
    async loadAll() {
      const records = await store.getAll();
      return records.map(fromPersistedRecord);
    },
    async remove(id) {
      await store.delete(id);
    },
  };
}
