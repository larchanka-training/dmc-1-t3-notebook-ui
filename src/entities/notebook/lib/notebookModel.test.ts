import { describe, expect, it } from "vitest";
import {
  hasOutputStoredAsDurableContent,
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
});
