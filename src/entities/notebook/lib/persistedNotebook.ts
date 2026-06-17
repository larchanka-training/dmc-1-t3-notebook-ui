import type { Notebook, NotebookBlock } from "../model/types";

/**
 * Durable local notebook format version. Bump when the persisted shape changes
 * and add an upgrade branch in {@link migrateRecord}.
 */
export const CURRENT_NOTEBOOK_SCHEMA_VERSION = 0;

/** A notebook wrapped with its persisted-format version. */
export type PersistedNotebookRecord = {
  schemaVersion: number;
  notebook: Notebook;
};

/** Ensure a block always carries a `meta.tags` array. */
function normalizeBlock(block: NotebookBlock): NotebookBlock {
  return { ...block, meta: { tags: block.meta?.tags ?? [] } };
}

/** Ensure a notebook always carries notebook-level and block-level tags. */
function normalizeNotebook(notebook: Notebook): Notebook {
  return {
    ...notebook,
    tags: notebook.tags ?? [],
    blocks: notebook.blocks.map(normalizeBlock),
  };
}

/** Wrap a notebook into a current-version persisted record. */
export function toPersistedRecord(notebook: Notebook): PersistedNotebookRecord {
  return {
    schemaVersion: CURRENT_NOTEBOOK_SCHEMA_VERSION,
    notebook: normalizeNotebook(notebook),
  };
}

/**
 * Upgrade an older record to the current version. v0 is the only version, so
 * this is a no-op seam; future versions branch on `record.schemaVersion` here.
 */
export function migrateRecord(
  record: PersistedNotebookRecord,
): PersistedNotebookRecord {
  return record;
}

/** Read a notebook back from a persisted record, migrating if needed. */
export function fromPersistedRecord(record: PersistedNotebookRecord): Notebook {
  const migrated = migrateRecord(record);
  return normalizeNotebook(migrated.notebook);
}
