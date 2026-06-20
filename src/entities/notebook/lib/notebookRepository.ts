import type { KeyValueStore } from "@/shared/persistence";
import type { Notebook, NotebookSyncMeta, StoredNotebook } from "../model/types";
import {
  DEFAULT_SYNC_META,
  fromPersistedRecord,
  toPersistedRecord,
  type PersistedNotebookRecord,
} from "./persistedNotebook";

export interface NotebookRepository {
  save(notebook: Notebook, sync?: NotebookSyncMeta): Promise<void>;
  load(id: string): Promise<StoredNotebook | undefined>;
  loadAll(): Promise<StoredNotebook[]>;
  remove(id: string): Promise<void>;
}

export function createNotebookRepository(
  store: KeyValueStore<PersistedNotebookRecord>,
): NotebookRepository {
  return {
    async save(notebook, sync = DEFAULT_SYNC_META) {
      await store.put(notebook.id, toPersistedRecord(notebook, sync));
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
