import { describe, it, expect } from "vitest";
import {
  CURRENT_NOTEBOOK_SCHEMA_VERSION,
  DEFAULT_SYNC_META,
  toPersistedRecord,
  fromPersistedRecord,
} from "./persistedNotebook";
import type { Notebook } from "../model/types";

const baseNotebook: Notebook = {
  id: "nb_1",
  title: "Test",
  revision: 1,
  createdAt: "2026-06-15T10:00:00.000Z",
  updatedAt: "2026-06-15T10:00:00.000Z",
  blocks: [
    { id: "blk_t", type: "text", content: { markdown: "# Hi" } },
    {
      id: "blk_c",
      type: "code",
      content: { language: "javascript", source: "1 + 1" },
    },
  ],
};

describe("persisted notebook record", () => {
  it("stamps the current schema version when persisting", () => {
    const record = toPersistedRecord(baseNotebook);
    expect(record.schemaVersion).toBe(CURRENT_NOTEBOOK_SCHEMA_VERSION);
    expect(record.notebook.id).toBe("nb_1");
  });

  it("normalizes missing tags to empty arrays on persist", () => {
    const record = toPersistedRecord(baseNotebook);
    expect(record.notebook.tags).toEqual([]);
    expect(
      record.notebook.blocks.every((block) => Array.isArray(block.meta?.tags)),
    ).toBe(true);
  });

  it("round-trips notebook-level and block-level tags", () => {
    const tagged: Notebook = {
      ...baseNotebook,
      tags: ["reference", "demo"],
      blocks: [
        {
          id: "blk_t",
          type: "text",
          content: { markdown: "# Hi" },
          meta: { tags: ["intro"] },
        },
        {
          id: "blk_c",
          type: "code",
          content: { language: "javascript", source: "1 + 1" },
          meta: { tags: ["example"] },
        },
      ],
    };

    const restored = fromPersistedRecord(toPersistedRecord(tagged)).notebook;

    expect(restored.tags).toEqual(["reference", "demo"]);
    expect(restored.blocks[0].meta?.tags).toEqual(["intro"]);
    expect(restored.blocks[1].meta?.tags).toEqual(["example"]);
  });

  it("restores a notebook from a current-version record", () => {
    const restored = fromPersistedRecord({
      schemaVersion: CURRENT_NOTEBOOK_SCHEMA_VERSION,
      notebook: baseNotebook,
      sync: DEFAULT_SYNC_META,
    }).notebook;

    expect(restored.id).toBe("nb_1");
    expect(restored.blocks).toHaveLength(2);
  });
});
