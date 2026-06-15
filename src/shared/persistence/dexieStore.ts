import Dexie from "dexie";
import type { KeyValueStore } from "./keyValueStore";

type Row<T> = { id: string; value: T };

/**
 * IndexedDB-backed {@link KeyValueStore} using Dexie (see ADR-002). Each value
 * is stored as a `{ id, value }` row keyed by `id` in the given table, so the
 * store stays generic and independent of the value shape.
 */
export function createDexieStore<T>(
  databaseName: string,
  tableName: string,
): KeyValueStore<T> {
  const db = new Dexie(databaseName);
  db.version(1).stores({ [tableName]: "id" });
  const table = () => db.table<Row<T>, string>(tableName);

  return {
    async get(id) {
      const row = await table().get(id);
      return row?.value;
    },
    async getAll() {
      const rows = await table().toArray();
      return rows.map((row) => row.value);
    },
    async put(id, value) {
      await table().put({ id, value });
    },
    async delete(id) {
      await table().delete(id);
    },
  };
}
