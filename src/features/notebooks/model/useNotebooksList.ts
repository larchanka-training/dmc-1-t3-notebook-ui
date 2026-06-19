import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";
import {
  createLocalNotebookRepository,
  DEFAULT_SYNC_META,
  type NotebookRepository,
  type ServerNotebookSummary,
} from "@/entities/notebook";
import { fetchServerVersion, listServerNotebooks } from "@/features/sync";
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
  const navigate = useNavigate();

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
      setNotebookList(mergeNotebookList(local, server));
      setNotebookListStatus("idle");
    })();

    return () => {
      cancelled = true;
    };
  }, [setNotebookList, setNotebookListStatus]);

  function onCreateNotebook() {
    const notebook = createNotebook();
    navigate(`/notebooks/${notebook.id}`);
  }

  async function onOpen(item: NotebookListItem) {
    if (item.origin === "remote-only" && item.serverId) {
      const newLocalId = `local-${Date.now().toString(36)}`;
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

  return {
    items,
    status,
    error,
    onCreateNotebook,
    onOpen,
  };
}
