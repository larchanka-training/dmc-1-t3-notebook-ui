import type { StoredNotebook, ServerNotebookSummary } from "@/entities/notebook";

export type NotebookOrigin = "local-only" | "synced" | "remote-only";

export type NotebookListItem = {
  id: string | null; // local id, or null for remote-only (resolved on open)
  serverId: string | null;
  title: string;
  updatedAt: string;
  origin: NotebookOrigin;
};

export function mergeNotebookList(
  local: StoredNotebook[],
  server: ServerNotebookSummary[],
): NotebookListItem[] {
  const localServerIds = new Set(
    local.map((s) => s.sync.serverId).filter((v): v is string => v !== null),
  );

  const localItems: NotebookListItem[] = local.map((s) => ({
    id: s.notebook.id,
    serverId: s.sync.serverId,
    title: s.notebook.title,
    updatedAt: s.notebook.updatedAt,
    origin: s.sync.serverId ? "synced" : "local-only",
  }));

  const remoteOnly: NotebookListItem[] = server
    .filter((item) => !localServerIds.has(item.id))
    .map((item) => ({
      id: null,
      serverId: item.id,
      title: item.title,
      updatedAt: item.updated_at,
      origin: "remote-only",
    }));

  return [...localItems, ...remoteOnly];
}
