import type { StateCreator } from "zustand";
import { DEFAULT_NOTEBOOK_TITLE, normalizeNotebookTitle } from "@/entities/notebook";
import type { NotebookListItem, NotebookListSlice } from "./types";

export const createNotebookListSlice: StateCreator<
  NotebookListSlice,
  [],
  [],
  NotebookListSlice
> = (set) => ({
  notebookList: {
    items: [],
    status: "idle",
    error: null,
  },
  setNotebookList: (items) =>
    set((state) => ({
      notebookList: { ...state.notebookList, items },
    })),
  setNotebookListStatus: (status, error = null) =>
    set((state) => ({
      notebookList: { ...state.notebookList, status, error },
    })),
  removeNotebookListItem: (localId, serverId) =>
    set((state) => ({
      notebookList: {
        ...state.notebookList,
        items: state.notebookList.items.filter((item) => {
          const sameLocalId = localId !== null && item.id === localId;
          const sameServerId = serverId !== null && item.serverId === serverId;

          return !sameLocalId && !sameServerId;
        }),
      },
    })),
  updateNotebookListItemTitle: (localId, serverId, title) =>
    set((state) => ({
      notebookList: {
        ...state.notebookList,
        items: state.notebookList.items.map((item) => {
          const sameLocalId = item.id === localId;
          const sameServerId = serverId !== null && item.serverId === serverId;

          return sameLocalId || sameServerId ? { ...item, title } : item;
        }),
      },
    })),
  createNotebook: (title = DEFAULT_NOTEBOOK_TITLE) => {
    const notebook: NotebookListItem = {
      id: Date.now().toString(36),
      serverId: null,
      title: normalizeNotebookTitle(title),
      updatedAt: new Date().toISOString(),
      origin: "local-only",
    };

    set((state) => ({
      notebookList: {
        ...state.notebookList,
        items: [notebook, ...state.notebookList.items],
      },
    }));

    return notebook;
  },
});
