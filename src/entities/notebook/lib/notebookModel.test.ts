import { describe, expect, it } from "vitest";
import {
  createTextBlock,
  hasOutputStoredAsDurableContent,
  insertBlockAfter,
  insertBlockBefore,
  notebookContentBlockIds,
} from "./notebookModel";
import { sampleNotebook } from "./sampleNotebook";

describe("notebook model boundaries", () => {
  it("keeps notebook blocks ordered by array order", () => {
    expect(notebookContentBlockIds(sampleNotebook)).toEqual([
      "blk_intro",
      "blk_prepare_data",
      "blk_observation",
      "blk_summarize",
    ]);
  });

  it("does not store execution output inside durable notebook blocks", () => {
    expect(hasOutputStoredAsDurableContent(sampleNotebook)).toBe(false);
  });

  it("inserts blocks before and after a target id", () => {
    const before = createTextBlock("blk_before");
    const after = createTextBlock("blk_after");
    const blocks = sampleNotebook.blocks;

    const withBefore = insertBlockBefore(blocks, "blk_prepare_data", before);
    expect(withBefore.map((block) => block.id)).toEqual([
      "blk_intro",
      "blk_before",
      "blk_prepare_data",
      "blk_observation",
      "blk_summarize",
    ]);

    const withAfter = insertBlockAfter(blocks, "blk_prepare_data", after);
    expect(withAfter.map((block) => block.id)).toEqual([
      "blk_intro",
      "blk_prepare_data",
      "blk_after",
      "blk_observation",
      "blk_summarize",
    ]);
  });
});
