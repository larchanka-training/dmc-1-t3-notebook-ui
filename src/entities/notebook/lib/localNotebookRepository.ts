import { createDexieStore, createInMemoryStore } from "@/shared/persistence";
import {
  createNotebookRepository,
  type NotebookRepository,
} from "./notebookRepository";
import type { PersistedNotebookRecord } from "./persistedNotebook";

const LOCAL_DB_NAME = "js-notebook";
const NOTEBOOKS_TABLE = "notebooks";

/**
 * Default local notebook repository. Uses IndexedDB (Dexie) in the browser and
 * falls back to a non-persistent in-memory store where IndexedDB is unavailable
 * (e.g. SSR or a test environment without an IndexedDB polyfill).
 */
export function createLocalNotebookRepository(): NotebookRepository {
  const store =
    typeof globalThis.indexedDB !== "undefined"
      ? createDexieStore<PersistedNotebookRecord>(LOCAL_DB_NAME, NOTEBOOKS_TABLE)
      : createInMemoryStore<PersistedNotebookRecord>();

  return createNotebookRepository(store);
}
