import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { syncNotebook } from "./syncEngine";
import { DEFAULT_SYNC_META, type Notebook } from "@/entities/notebook";
import { ApiError } from "@/shared/api";
import * as api from "../api/notebookSyncApi";

const notebook: Notebook = {
  id: "local-1",
  title: "T",
  tags: [],
  revision: 0,
  createdAt: "2026-06-18T10:00:00.000Z",
  updatedAt: "2026-06-18T10:00:00.000Z",
  blocks: [],
};

const serverNotebook = (revision: number) => ({
  id: "srv-1",
  title: "T",
  tags: [],
  blocks: [],
  revision,
  created_at: "2026-06-18T10:00:00.000Z",
  updated_at: "2026-06-18T11:00:00.000Z",
  last_synced_at: "2026-06-18T11:00:00.000Z",
});

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("syncNotebook", () => {
  it("creates on the server on first sync (serverId null)", async () => {
    vi.spyOn(api, "createNotebookOnServer").mockResolvedValue(serverNotebook(1));
    const meta = await syncNotebook(notebook, DEFAULT_SYNC_META);
    expect(api.createNotebookOnServer).toHaveBeenCalledOnce();
    expect(meta.serverId).toBe("srv-1");
    expect(meta.baseRevision).toBe(1);
    expect(meta.status).toBe("synced");
  });

  it("pushes via /sync when already server-backed", async () => {
    vi.spyOn(api, "syncNotebookOnServer").mockResolvedValue(serverNotebook(3));
    const meta = await syncNotebook(notebook, {
      ...DEFAULT_SYNC_META,
      serverId: "srv-1",
      baseRevision: 2,
      status: "unsynced",
    });
    expect(api.syncNotebookOnServer).toHaveBeenCalledWith("srv-1", 2, notebook);
    expect(meta.baseRevision).toBe(3);
    expect(meta.status).toBe("synced");
  });

  it("returns conflict status with server revision on 409", async () => {
    vi.spyOn(api, "syncNotebookOnServer").mockRejectedValue(
      new ApiError(409, "notebook_sync_conflict", "conflict"),
    );
    vi.spyOn(api, "getServerNotebook").mockResolvedValue(serverNotebook(5));
    const meta = await syncNotebook(notebook, {
      ...DEFAULT_SYNC_META,
      serverId: "srv-1",
      baseRevision: 2,
    });
    expect(meta.status).toBe("conflict");
    expect(meta.serverRevision).toBe(5);
  });

  it("returns error status on a network failure", async () => {
    vi.spyOn(api, "syncNotebookOnServer").mockRejectedValue(
      new ApiError(0, "request_failed", "offline"),
    );
    const meta = await syncNotebook(notebook, {
      ...DEFAULT_SYNC_META,
      serverId: "srv-1",
      baseRevision: 2,
    });
    expect(meta.status).toBe("error");
    expect(meta.lastError).toBe("offline");
  });
});
