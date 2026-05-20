import { describe, expect, it } from "vitest";
import { outputBlockIds } from "./outputModel";
import { sampleOutputPlaceholders } from "./sampleOutputs";

describe("output model boundaries", () => {
  it("binds placeholders to code blocks outside notebook content", () => {
    expect(outputBlockIds(sampleOutputPlaceholders)).toEqual([
      "blk_prepare_data",
      "blk_summarize",
    ]);
  });
});
