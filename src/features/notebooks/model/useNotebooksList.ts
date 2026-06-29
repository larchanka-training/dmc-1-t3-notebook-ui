import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";
import {
  createLocalDraftNotebook,
  createLocalNotebookRepository,
  DEFAULT_SYNC_META,
  type NotebookRepository,
  type ServerNotebookSummary,
} from "@/entities/notebook";
import {
  deleteServerNotebook,
  fetchServerVersion,
  listServerNotebooks,
} from "@/features/sync";
import { mergeNotebookList, type NotebookListItem } from "./mergeNotebookList";

type UseNotebooksListOptions = {
  repository?: NotebookRepository;
};

const defaultNotebookRepository = createLocalNotebookRepository();

export function useNotebooksList(options: UseNotebooksListOptions = {}) {
  const { items, status, error } = useAppStore((s) => s.notebookList);
  const createNotebook = useAppStore((s) => s.createNotebook);
  const setNotebookList = useAppStore((s) => s.setNotebookList);
  const setNotebookListStatus = useAppStore((s) => s.setNotebookListStatus);
  const removeNotebookListItem = useAppStore((s) => s.removeNotebookListItem);
  const navigate = useNavigate();
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const repositoryRef = useRef<NotebookRepository>(
    options.repository ?? defaultNotebookRepository,
  );

  useEffect(() => {
    let cancelled = false;
    setNotebookListStatus("loading");

    void (async () => {
      const local = await repositoryRef.current.loadAll();
      // Reading the list must never fail because the backend is unreachable;
      // degrade to the local working copies only.
      let server: ServerNotebookSummary[] = [];
      try {
        server = await listServerNotebooks();
      } catch {
        server = [];
      }
      if (cancelled) {
        return;
      }
      const loadedItems = mergeNotebookList(local, server);
      const currentItems = useAppStore.getState().notebookList.items;
      const itemsByKey = new Map<string, NotebookListItem>();

      for (const item of currentItems) {
        itemsByKey.set(`${item.id ?? "null"}::${item.serverId ?? "null"}`, item);
      }
      for (const item of loadedItems) {
        itemsByKey.set(`${item.id ?? "null"}::${item.serverId ?? "null"}`, item);
      }

      setNotebookList(Array.from(itemsByKey.values()));
      setNotebookListStatus("idle");
    })();

    return () => {
      cancelled = true;
    };
  }, [setNotebookList, setNotebookListStatus]);

  function onCreateNotebook() {
    const notebook = createNotebook();
    if (!notebook.id) {
      return;
    }
    const notebookId = notebook.id;

    void (async () => {
      await repositoryRef.current.save(
        createLocalDraftNotebook(notebookId, notebook.title),
        DEFAULT_SYNC_META,
      );
      navigate(`/notebooks/${notebookId}`);
    })();
  }

  async function onOpen(item: NotebookListItem) {
    if (item.origin === "remote-only" && item.serverId) {
      const newLocalId = Date.now().toString(36);
      const notebook = await fetchServerVersion(item.serverId, newLocalId);
      await repositoryRef.current.save(notebook, {
        ...DEFAULT_SYNC_META,
        serverId: item.serverId,
        baseRevision: notebook.revision,
        status: "synced",
      });
      navigate(`/notebooks/${newLocalId}`);
      return;
    }

    if (item.id) {
      navigate(`/notebooks/${item.id}`);
    }
  }

  async function onDelete(item: NotebookListItem) {
    const confirmed = globalThis.confirm?.(`Delete notebook "${item.title}"?`) ?? true;
    if (!confirmed) {
      return;
    }

    const itemKey = item.id ?? item.serverId;
    if (!itemKey) {
      return;
    }

    setPendingDeleteKey(itemKey);
    setDeleteError(null);

    try {
      if (item.serverId) {
        await deleteServerNotebook(item.serverId);
      }
      if (item.id) {
        await repositoryRef.current.remove(item.id);
      }
      removeNotebookListItem(item.id, item.serverId);
    } catch {
      setDeleteError(`Failed to delete "${item.title}".`);
    } finally {
      setPendingDeleteKey(null);
    }
  }

  return {
    items,
    status,
    error,
    pendingDeleteKey,
    deleteError,
    onCreateNotebook,
    onOpen,
    onDelete,
  };
}
