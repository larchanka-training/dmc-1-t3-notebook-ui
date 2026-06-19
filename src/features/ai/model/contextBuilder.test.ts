import { describe, expect, it } from "vitest";
import {
  createCodeBlock,
  createTextBlock,
  type NotebookBlock,
  type TextBlock,
} from "@/entities/notebook";
import { buildAiRequestContext, parseAiSourceText } from "./contextBuilder";

describe("AI context builder", () => {
  it("defaults to scope this and strips no directive when absent", () => {
    expect(parseAiSourceText("Write a sum function")).toEqual({
      prompt: "Write a sum function",
      scope: "this",
    });
  });

  it("builds minimal source-only context for scope this", () => {
    const sourceBlock = createTextBlock(
      "blk_source",
      "Write a sum function",
    ) as TextBlock;
    const context = buildAiRequestContext({
      blocks: [
        createTextBlock("blk_intro", "Notebook intro"),
        createCodeBlock("blk_prepare", "const helper = 1;"),
        sourceBlock,
      ],
      sourceBlock,
      notebookTitle: "  JavaScript Notebook Draft  ",
    });

    expect(context.scope).toBe("this");
    expect(context.prompt).toBe("Write a sum function");
    expect(context.notebookTitle).toBe("JavaScript Notebook Draft");
    expect(context.relevantBlocks).toEqual([
      {
        blockId: "blk_source",
        type: "text",
        content: "Write a sum function",
      },
    ]);
  });

  it("includes notebook blocks from the start through the source for scope notebook", () => {
    const sourceBlock = createTextBlock(
      "blk_source",
      "scope: notebook\nRefactor the parser using earlier helpers.",
    ) as TextBlock;
    const context = buildAiRequestContext({
      blocks: [
        createTextBlock("blk_intro", "Notebook intro"),
        createCodeBlock("blk_prepare", "const helper = 1;"),
        sourceBlock,
        createCodeBlock("blk_after", "console.log('should not be included');"),
      ],
      sourceBlock,
      notebookTitle: "Notebook",
    });

    expect(context.scope).toBe("notebook");
    expect(context.prompt).toBe("Refactor the parser using earlier helpers.");
    expect(context.relevantBlocks.map((block) => block.blockId)).toEqual([
      "blk_intro",
      "blk_prepare",
      "blk_source",
    ]);
  });

  it("drops the farthest low-priority blocks first when the budget is exceeded", () => {
    const sourceBlock = createTextBlock(
      "blk_source",
      "scope: notebook\nWrite a reusable parser using earlier setup code.",
    ) as TextBlock;
    const distantBlocks: NotebookBlock[] = Array.from({ length: 24 }, (_, index) =>
      index % 2 === 0
        ? createTextBlock(`blk_text_${index}`, `Text block ${index}`)
        : createCodeBlock(`blk_code_${index}`, `const helper${index} = ${index};`),
    );
    const context = buildAiRequestContext({
      blocks: [...distantBlocks, sourceBlock],
      sourceBlock,
      notebookTitle: "Notebook",
    });

    expect(context.relevantBlocks).toHaveLength(20);
    expect(context.relevantBlocks[context.relevantBlocks.length - 1]?.blockId).toBe(
      "blk_source",
    );
    expect(context.relevantBlocks.some((block) => block.blockId === "blk_text_0")).toBe(
      false,
    );
    expect(context.relevantBlocks.some((block) => block.blockId === "blk_code_1")).toBe(
      false,
    );
  });
});
