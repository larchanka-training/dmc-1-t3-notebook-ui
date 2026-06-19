import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { createInMemoryStore } from "@/shared/persistence";
import {
  createNotebookRepository,
  DEFAULT_SYNC_META,
  sampleNotebook,
  type NotebookRepository,
  type ServerNotebook,
} from "@/entities/notebook";
import {
  setMockServerNotebook,
  setMockServerNotebooks,
} from "@test/msw/handlers/notebooks";
import { useNotebooksList } from "./useNotebooksList";

const makeRepo = (): NotebookRepository =>
  createNotebookRepository(createInMemoryStore());

let lastLocation = "";

function LocationProbe() {
  lastLocation = useLocation().pathname;
  return null;
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/notebooks"]}>
      {children}
      <LocationProbe />
    </MemoryRouter>
  );
}

const serverNotebook: ServerNotebook = {
  id: "srv-remote",
  title: "Remote notebook",
  tags: [],
  blocks: sampleNotebook.blocks,
  revision: 7,
  created_at: "2026-06-18T10:00:00.000Z",
  updated_at: "2026-06-18T11:00:00.000Z",
  last_synced_at: "2026-06-18T11:00:00.000Z",
};

const serverSummary = {
  id: "srv-remote",
  title: "Remote notebook",
  tags: [] as string[],
  revision: 7,
  created_at: "2026-06-18T10:00:00.000Z",
  updated_at: "2026-06-18T11:00:00.000Z",
};

describe("useNotebooksList (merged)", () => {
  it("merges local working copies with the server list on mount", async () => {
    const repository = makeRepo();
    await repository.save(
      { ...sampleNotebook, id: "local-1", title: "Local notebook" },
      DEFAULT_SYNC_META,
    );
    setMockServerNotebooks([serverSummary]);

    const { result } = renderHook(() => useNotebooksList({ repository }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.origin).sort()).toEqual([
      "local-only",
      "remote-only",
    ]);
  });

  it("degrades to the local list when the server list fetch fails", async () => {
    const { http, HttpResponse } = await import("msw");
    const { server } = await import("@test/msw/server");
    const { getApiBaseUrl } = await import("@/shared/api");
    server.use(
      http.get(`${getApiBaseUrl()}/notebooks`, () =>
        HttpResponse.json(
          { error: { code: "server_error", message: "boom" } },
          { status: 500 },
        ),
      ),
    );

    const repository = makeRepo();
    await repository.save(
      { ...sampleNotebook, id: "local-1", title: "Local notebook" },
      DEFAULT_SYNC_META,
    );

    const { result } = renderHook(() => useNotebooksList({ repository }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ origin: "local-only" });
  });

  it("opens a remote-only notebook by fetching and saving a local working copy", async () => {
    const repository = makeRepo();
    setMockServerNotebooks([serverSummary]);
    setMockServerNotebook(serverNotebook);

    const { result } = renderHook(() => useNotebooksList({ repository }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    const remote = result.current.items[0];
    expect(remote.origin).toBe("remote-only");

    await act(async () => {
      await result.current.onOpen(remote);
    });

    await waitFor(() => expect(lastLocation).toMatch(/^\/notebooks\/local-/));
    const newLocalId = lastLocation.replace("/notebooks/", "");
    const stored = await repository.load(newLocalId);
    expect(stored?.notebook.title).toBe("Remote notebook");
    expect(stored?.sync.serverId).toBe("srv-remote");
    expect(stored?.sync.baseRevision).toBe(7);
    expect(stored?.sync.status).toBe("synced");
  });
});
