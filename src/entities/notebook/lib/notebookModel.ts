import type { CodeBlock, Notebook, NotebookBlock } from "../model/types";

export function notebookContentBlockIds(notebook: Notebook): string[] {
  return notebook.blocks.map((block) => block.id);
}

export function hasOutputStoredAsDurableContent(notebook: Notebook): boolean {
  return notebook.blocks.some((block) => "output" in block);
}

export function insertBlockBefore(
  blocks: NotebookBlock[],
  targetBlockId: string,
  blockToInsert: NotebookBlock,
): NotebookBlock[] {
  const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);

  if (targetIndex === -1) {
    return [blockToInsert, ...blocks];
  }

  return [...blocks.slice(0, targetIndex), blockToInsert, ...blocks.slice(targetIndex)];
}

export function insertBlockAfter(
  blocks: NotebookBlock[],
  targetBlockId: string,
  blockToInsert: NotebookBlock,
): NotebookBlock[] {
  const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);

  if (targetIndex === -1) {
    return [...blocks, blockToInsert];
  }

  return [
    ...blocks.slice(0, targetIndex + 1),
    blockToInsert,
    ...blocks.slice(targetIndex + 1),
  ];
}

export function deleteBlock(
  blocks: NotebookBlock[],
  targetBlockId: string,
): NotebookBlock[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  return blocks.filter((block) => block.id !== targetBlockId);
}

export function moveBlock(
  blocks: NotebookBlock[],
  targetBlockId: string,
  direction: "up" | "down",
): NotebookBlock[] {
  const currentIndex = blocks.findIndex((block) => block.id === targetBlockId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex === -1 || nextIndex < 0 || nextIndex >= blocks.length) {
    return blocks;
  }

  const nextBlocks = [...blocks];
  const currentBlock = nextBlocks[currentIndex];
  nextBlocks[currentIndex] = nextBlocks[nextIndex];
  nextBlocks[nextIndex] = currentBlock;

  return nextBlocks;
}

export function updateTextBlockMarkdown(
  blocks: NotebookBlock[],
  blockId: string,
  markdown: string,
): NotebookBlock[] {
  return blocks.map((block) =>
    block.id === blockId && block.type === "text"
      ? { ...block, content: { markdown } }
      : block,
  );
}

export function updateCodeBlockSource(
  blocks: NotebookBlock[],
  blockId: string,
  source: string,
): NotebookBlock[] {
  return blocks.map((block) =>
    block.id === blockId && block.type === "code"
      ? { ...block, content: { ...block.content, source } }
      : block,
  );
}

export type GeneratedCodeInsertionTarget =
  | {
      kind: "existing-empty-code";
      blockId: string;
    }
  | {
      kind: "new-after-source";
    };

export function resolveGeneratedCodeInsertionTarget(
  blocks: NotebookBlock[],
  sourceBlockId: string,
): GeneratedCodeInsertionTarget {
  const sourceIndex = blocks.findIndex((block) => block.id === sourceBlockId);
  if (sourceIndex < 0) {
    return { kind: "new-after-source" };
  }

  const nextBlock = blocks[sourceIndex + 1];
  if (nextBlock?.type === "code" && nextBlock.content.source.trim().length === 0) {
    return {
      kind: "existing-empty-code",
      blockId: nextBlock.id,
    };
  }

  return { kind: "new-after-source" };
}

export function createTextBlock(id: string, markdown = ""): NotebookBlock {
  return {
    id,
    type: "text",
    content: {
      markdown,
    },
  };
}

export function createCodeBlock(id: string, source = ""): CodeBlock {
  return {
    id,
    type: "code",
    content: {
      language: "javascript",
      source,
    },
  };
}
