import type { CodeBlock, TextBlock } from "@/entities/block";

export type NotebookBlock = TextBlock | CodeBlock;

export type Notebook = {
  id: string;
  title: string;
  tags?: string[];
  blocks: NotebookBlock[];
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type NotebookSyncStatus =
  | "unsynced"
  | "syncing"
  | "synced"
  | "conflict"
  | "error";

export type NotebookSyncMeta = {
  serverId: string | null;
  baseRevision: number;
  status: NotebookSyncStatus;
  serverRevision: number | null;
  lastSyncedAt: string | null;
  lastError: string | null;
};

export type StoredNotebook = {
  notebook: Notebook;
  sync: NotebookSyncMeta;
};

export type { CodeBlock, TextBlock };
