import { describe, it, expect } from "vitest";
import { toServerSnapshot, fromServerNotebook } from "./serverNotebook";
import type { Notebook } from "../model/types";

const notebook: Notebook = {
  id: "local-1",
  title: "T",
  tags: ["x"],
  revision: 4,
  createdAt: "2026-06-18T10:00:00.000Z",
  updatedAt: "2026-06-18T10:00:00.000Z",
  blocks: [
    { id: "b1", type: "text", content: { markdown: "# Hi" }, meta: { tags: ["i"] } },
  ],
};

describe("server notebook mapping", () => {
  it("builds a server content_snapshot from a local notebook", () => {
    const snap = toServerSnapshot(notebook);
    expect(snap).toEqual({
      title: "T",
      tags: ["x"],
      blocks: notebook.blocks,
      metadata: { version: 1 },
    });
  });

  it("builds a local notebook from a server response, keeping a chosen local id", () => {
    const local = fromServerNotebook(
      {
        id: "srv-uuid",
        title: "T",
        tags: ["x"],
        blocks: notebook.blocks,
        revision: 5,
        created_at: "2026-06-18T10:00:00.000Z",
        updated_at: "2026-06-18T11:00:00.000Z",
        last_synced_at: "2026-06-18T11:00:00.000Z",
      },
      "local-1",
    );
    expect(local.id).toBe("local-1");
    expect(local.title).toBe("T");
    expect(local.tags).toEqual(["x"]);
    expect(local.revision).toBe(5);
    expect(local.blocks[0].meta?.tags).toEqual(["i"]);
  });
});
