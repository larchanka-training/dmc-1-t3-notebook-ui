import type { Notebook, NotebookBlock, NotebookSyncMeta } from "../model/types";

export const CURRENT_NOTEBOOK_SCHEMA_VERSION = 0;

export const DEFAULT_SYNC_META: NotebookSyncMeta = {
  serverId: null,
  baseRevision: 0,
  status: "unsynced",
  serverRevision: null,
  lastSyncedAt: null,
  lastError: null,
};

export type PersistedNotebookRecord = {
  schemaVersion: number;
  notebook: Notebook;
  sync: NotebookSyncMeta;
};

function normalizeBlock(block: NotebookBlock): NotebookBlock {
  return { ...block, meta: { tags: block.meta?.tags ?? [] } };
}

function normalizeNotebook(notebook: Notebook): Notebook {
  return {
    ...notebook,
    tags: notebook.tags ?? [],
    blocks: notebook.blocks.map(normalizeBlock),
  };
}

export function toPersistedRecord(
  notebook: Notebook,
  sync: NotebookSyncMeta = DEFAULT_SYNC_META,
): PersistedNotebookRecord {
  return {
    schemaVersion: CURRENT_NOTEBOOK_SCHEMA_VERSION,
    notebook: normalizeNotebook(notebook),
    sync,
  };
}

export function migrateRecord(
  record: PersistedNotebookRecord,
): PersistedNotebookRecord {
  return record;
}

export function fromPersistedRecord(record: PersistedNotebookRecord): {
  notebook: Notebook;
  sync: NotebookSyncMeta;
} {
  const migrated = migrateRecord(record);
  return {
    notebook: normalizeNotebook(migrated.notebook),
    sync: migrated.sync ?? DEFAULT_SYNC_META,
  };
}
