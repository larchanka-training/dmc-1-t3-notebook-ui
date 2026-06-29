import { httpClient } from "@/shared/api";
import {
  toServerSnapshot,
  type Notebook,
  type ServerNotebook,
  type ServerNotebookSummary,
} from "@/entities/notebook";

const NOTEBOOKS = "/notebooks";

export function createNotebookOnServer(notebook: Notebook): Promise<ServerNotebook> {
  return httpClient.post<ServerNotebook>(NOTEBOOKS, {
    title: notebook.title,
    content_snapshot: toServerSnapshot(notebook),
  });
}

export function patchNotebookTitleOnServer(
  serverId: string,
  title: string,
): Promise<ServerNotebook> {
  return httpClient.patch<ServerNotebook>(`${NOTEBOOKS}/${serverId}`, { title });
}

export function syncNotebookOnServer(
  serverId: string,
  baseRevision: number,
  notebook: Notebook,
): Promise<ServerNotebook> {
  return httpClient.post<ServerNotebook>(`${NOTEBOOKS}/${serverId}/sync`, {
    base_revision: baseRevision,
    content_snapshot: toServerSnapshot(notebook),
  });
}

export function getServerNotebook(serverId: string): Promise<ServerNotebook> {
  return httpClient.get<ServerNotebook>(`${NOTEBOOKS}/${serverId}`);
}

export function listServerNotebooks(): Promise<ServerNotebookSummary[]> {
  return httpClient.get<ServerNotebookSummary[]>(NOTEBOOKS);
}

export function deleteServerNotebook(serverId: string): Promise<void> {
  return httpClient.delete<void>(`${NOTEBOOKS}/${serverId}`);
}
