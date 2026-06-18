import type { NotebookBlock, TextBlock } from "@/entities/notebook";
import type { AiScope, AiRelevantBlock } from "./types";

const SCOPE_DIRECTIVE_RE = /^\s*scope:\s*(this|notebook)\s*(?:\r?\n|$)/i;
const MAX_NOTEBOOK_TITLE_CHARS = 200;
const MAX_RELEVANT_BLOCKS = 20;
const MAX_RELEVANT_BLOCK_CONTENT_CHARS = 8000;
const MAX_COMBINED_TEXT_CHARS = 50000;

function blockContent(block: NotebookBlock): string {
  return block.type === "text" ? block.content.markdown : block.content.source;
}

function toRelevantBlock(block: NotebookBlock): AiRelevantBlock {
  return {
    blockId: block.id,
    type: block.type,
    content: blockContent(block).slice(0, MAX_RELEVANT_BLOCK_CONTENT_CHARS),
  };
}

function totalContextChars(params: {
  prompt: string;
  sourceText: string;
  notebookTitle?: string;
  relevantBlocks: AiRelevantBlock[];
}): number {
  return (
    params.prompt.length +
    params.sourceText.length +
    (params.notebookTitle?.length ?? 0) +
    params.relevantBlocks.reduce((sum, block) => sum + block.content.length, 0)
  );
}

function trimRelevantBlocksToBudget(params: {
  prompt: string;
  sourceText: string;
  notebookTitle?: string;
  relevantBlocks: AiRelevantBlock[];
  sourceBlockId: string;
}): AiRelevantBlock[] {
  const relevantBlocks = [...params.relevantBlocks];

  while (
    relevantBlocks.length > MAX_RELEVANT_BLOCKS ||
    totalContextChars({
      prompt: params.prompt,
      sourceText: params.sourceText,
      notebookTitle: params.notebookTitle,
      relevantBlocks,
    }) > MAX_COMBINED_TEXT_CHARS
  ) {
    const removableIndex = relevantBlocks.findIndex(
      (block) => block.blockId !== params.sourceBlockId,
    );

    if (removableIndex < 0) {
      break;
    }

    relevantBlocks.splice(removableIndex, 1);
  }

  return relevantBlocks;
}

export function parseAiSourceText(markdown: string): {
  prompt: string;
  scope: AiScope;
} {
  const trimmed = markdown.trim();
  const match = trimmed.match(SCOPE_DIRECTIVE_RE);

  if (!match) {
    return { prompt: trimmed, scope: "this" };
  }

  const scope = match[1].toLowerCase() === "notebook" ? "notebook" : "this";

  return {
    prompt: trimmed.slice(match[0].length).trim(),
    scope,
  };
}

export function buildAiRequestContext(params: {
  blocks: NotebookBlock[];
  sourceBlock: TextBlock;
  notebookTitle: string;
}): {
  prompt: string;
  scope: AiScope;
  sourceText: string;
  notebookTitle?: string;
  relevantBlocks: AiRelevantBlock[];
} {
  const derived = parseAiSourceText(params.sourceBlock.content.markdown);
  const trimmedTitle = params.notebookTitle.trim();
  const notebookTitle =
    trimmedTitle.length > 0
      ? trimmedTitle.slice(0, MAX_NOTEBOOK_TITLE_CHARS)
      : undefined;
  const sourceIndex = params.blocks.findIndex(
    (block) => block.id === params.sourceBlock.id,
  );
  const scopedBlocks =
    derived.scope === "notebook" && sourceIndex >= 0
      ? params.blocks.slice(0, sourceIndex + 1)
      : [params.sourceBlock];
  const relevantBlocks = trimRelevantBlocksToBudget({
    prompt: derived.prompt,
    sourceText: derived.prompt,
    notebookTitle,
    relevantBlocks: scopedBlocks.map(toRelevantBlock),
    sourceBlockId: params.sourceBlock.id,
  });

  return {
    prompt: derived.prompt,
    scope: derived.scope,
    sourceText: derived.prompt,
    notebookTitle,
    relevantBlocks,
  };
}
