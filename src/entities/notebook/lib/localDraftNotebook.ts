import type { Notebook } from "../model/types";

export const DEFAULT_NOTEBOOK_TITLE = "Untitled";

export function normalizeNotebookTitle(title?: string | null): string {
  const normalized = title?.trim();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_NOTEBOOK_TITLE;
}

export function createLocalDraftNotebook(
  localId: string,
  title: string = DEFAULT_NOTEBOOK_TITLE,
): Notebook {
  const now = new Date().toISOString();

  return {
    id: localId,
    title: normalizeNotebookTitle(title),
    tags: [],
    blocks: [],
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
}
