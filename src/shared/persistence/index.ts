/** IndexedDB / Dexie adapters — see ADR-002. */
export type { KeyValueStore } from "./keyValueStore";
export { createInMemoryStore } from "./keyValueStore";
export { createDexieStore } from "./dexieStore";
