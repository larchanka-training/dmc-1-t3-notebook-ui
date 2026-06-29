export type {
  CodeBlock,
  Notebook,
  NotebookBlock,
  NotebookSyncMeta,
  NotebookSyncStatus,
  StoredNotebook,
  TextBlock,
} from "./model/types";
export {
  createCodeBlock,
  createTextBlock,
  deleteBlock,
  hasOutputStoredAsDurableContent,
  insertBlockBefore,
  insertBlockAfter,
  moveBlock,
  notebookContentBlockIds,
  resolveGeneratedCodeInsertionTarget,
  updateCodeBlockSource,
  updateTextBlockMarkdown,
  type GeneratedCodeInsertionTarget,
} from "./lib/notebookModel";
export { sampleNotebook } from "./lib/sampleNotebook";
export {
  DEFAULT_NOTEBOOK_TITLE,
  createLocalDraftNotebook,
  normalizeNotebookTitle,
} from "./lib/localDraftNotebook";
export {
  CURRENT_NOTEBOOK_SCHEMA_VERSION,
  DEFAULT_SYNC_META,
  fromPersistedRecord,
  migrateRecord,
  toPersistedRecord,
  type PersistedNotebookRecord,
} from "./lib/persistedNotebook";
export {
  createNotebookRepository,
  type NotebookRepository,
} from "./lib/notebookRepository";
export { createLocalNotebookRepository } from "./lib/localNotebookRepository";
export {
  applyServerNotebookMetadata,
  toServerSnapshot,
  fromServerNotebook,
  type ServerNotebook,
  type ServerNotebookSummary,
} from "./lib/serverNotebook";
