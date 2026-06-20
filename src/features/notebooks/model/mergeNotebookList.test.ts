import { describe, it, expect } from "vitest";
import { mergeNotebookList } from "./mergeNotebookList";
import { DEFAULT_SYNC_META, type StoredNotebook } from "@/entities/notebook";
import type { ServerNotebookSummary } from "@/entities/notebook";

const stored = (id: string, serverId: string | null): StoredNotebook => ({
  notebook: {
    id,
    title: `local ${id}`,
    revision: 1,
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
    blocks: [],
  },
  sync: { ...DEFAULT_SYNC_META, serverId, status: serverId ? "synced" : "unsynced" },
});

const summary = (id: string, title: string): ServerNotebookSummary => ({
  id,
  title,
  tags: [],
  revision: 1,
  created_at: "2026-06-18T10:00:00.000Z",
  updated_at: "2026-06-18T10:00:00.000Z",
});

describe("mergeNotebookList", () => {
  it("keeps a local-only notebook (serverId null)", () => {
    const items = mergeNotebookList([stored("local-1", null)], []);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "local-1", origin: "local-only" });
  });

  it("merges a local notebook with its server item by serverId (one entry)", () => {
    const items = mergeNotebookList(
      [stored("local-1", "srv-1")],
      [summary("srv-1", "server title")],
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "local-1",
      serverId: "srv-1",
      origin: "synced",
    });
  });

  it("adds a remote-only notebook not present locally", () => {
    const items = mergeNotebookList([], [summary("srv-2", "remote")]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      serverId: "srv-2",
      origin: "remote-only",
      title: "remote",
    });
  });
});
