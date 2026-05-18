import { describe, expect, it } from "vitest";
import {
  hasOutputStoredAsDurableContent,
  notebookContentBlockIds,
  outputBlockIds
} from "./notebookModel";
import {
  sampleNotebook,
  sampleOutputPlaceholders
} from "./sampleNotebook";

describe("notebook model boundaries", () => {
  it("keeps notebook blocks ordered by array order", () => {
    expect(notebookContentBlockIds(sampleNotebook)).toEqual([
      "blk_intro",
      "blk_prepare_data",
      "blk_observation",
      "blk_summarize"
    ]);
  });

  it("keeps execution outputs outside durable notebook content", () => {
    expect(hasOutputStoredAsDurableContent(sampleNotebook)).toBe(false);
    expect(outputBlockIds(sampleOutputPlaceholders)).toEqual([
      "blk_prepare_data",
      "blk_summarize"
    ]);
  });
});
