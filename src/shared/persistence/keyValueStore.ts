/**
 * Minimal async key-value store keyed by string id. Storage-agnostic so domain
 * repositories can depend on it without knowing about IndexedDB/Dexie.
 */
export interface KeyValueStore<T> {
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  put(id: string, value: T): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * In-memory {@link KeyValueStore}. Used as a test double and as a
 * non-persistent fallback when IndexedDB is unavailable.
 */
export function createInMemoryStore<T>(): KeyValueStore<T> {
  const map = new Map<string, T>();
  return {
    async get(id) {
      return map.get(id);
    },
    async getAll() {
      return [...map.values()];
    },
    async put(id, value) {
      map.set(id, value);
    },
    async delete(id) {
      map.delete(id);
    },
  };
}
