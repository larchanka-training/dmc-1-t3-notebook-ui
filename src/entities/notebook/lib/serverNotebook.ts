import type { Notebook, NotebookBlock } from "../model/types";

/** Server response shape for a full notebook (`GET`/`POST`/`/sync`). */
export type ServerNotebook = {
  id: string;
  title: string;
  tags: string[];
  blocks: NotebookBlock[];
  revision: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
};

/** Server list-item shape (`GET /notebooks`). */
export type ServerNotebookSummary = {
  id: string;
  title: string;
  tags: string[];
  revision: number;
  created_at: string;
  updated_at: string;
};

/** Canonical content_snapshot for create/sync requests. */
export function toServerSnapshot(notebook: Notebook): {
  title: string;
  tags: string[];
  blocks: NotebookBlock[];
  metadata: { version: number };
} {
  return {
    title: notebook.title,
    tags: notebook.tags ?? [],
    blocks: notebook.blocks,
    metadata: { version: 1 },
  };
}

/** Map a server notebook into a local working copy under `localId`. */
export function fromServerNotebook(server: ServerNotebook, localId: string): Notebook {
  return {
    id: localId,
    title: server.title,
    tags: server.tags,
    blocks: server.blocks,
    revision: server.revision,
    createdAt: server.created_at,
    updatedAt: server.updated_at,
  };
}
