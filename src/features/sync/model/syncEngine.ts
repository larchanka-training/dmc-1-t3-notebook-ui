import { ApiError } from "@/shared/api";
import {
  fromServerNotebook,
  type Notebook,
  type NotebookSyncMeta,
} from "@/entities/notebook";
import {
  createNotebookOnServer,
  getServerNotebook,
  syncNotebookOnServer,
} from "../api/notebookSyncApi";

/** Push the local notebook to the backend (create-on-first-sync, then /sync). */
export async function syncNotebook(
  notebook: Notebook,
  meta: NotebookSyncMeta,
): Promise<NotebookSyncMeta> {
  try {
    if (meta.serverId === null) {
      const server = await createNotebookOnServer(notebook);
      return {
        ...meta,
        serverId: server.id,
        baseRevision: server.revision,
        serverRevision: null,
        status: "synced",
        lastSyncedAt: server.updated_at,
        lastError: null,
      };
    }
    const server = await syncNotebookOnServer(
      meta.serverId,
      meta.baseRevision,
      notebook,
    );
    return {
      ...meta,
      baseRevision: server.revision,
      serverRevision: null,
      status: "synced",
      lastSyncedAt: server.updated_at,
      lastError: null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409 && meta.serverId) {
      let serverRevision = meta.baseRevision;
      try {
        serverRevision = (await getServerNotebook(meta.serverId)).revision;
      } catch {
        // keep the optimistic value if the follow-up read fails
      }
      return { ...meta, status: "conflict", serverRevision };
    }
    return {
      ...meta,
      status: "error",
      lastError: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

/** Fetch the current server working copy (for Review/Replace), mapped to `localId`. */
export async function fetchServerVersion(
  serverId: string,
  localId: string,
): Promise<Notebook> {
  return fromServerNotebook(await getServerNotebook(serverId), localId);
}

/** Adopt the server version as the new local base (Replace local with server). */
export function adoptServerVersion(
  meta: NotebookSyncMeta,
  serverRevision: number,
  lastSyncedAt: string,
): NotebookSyncMeta {
  return {
    ...meta,
    baseRevision: serverRevision,
    serverRevision: null,
    status: "synced",
    lastSyncedAt,
    lastError: null,
  };
}
