export type { CodeBlock, Notebook, NotebookBlock, TextBlock } from "./model/types";
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
  CURRENT_NOTEBOOK_SCHEMA_VERSION,
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
