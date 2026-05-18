import type { Notebook } from "./types";
import type { OutputPlaceholder } from "../output/types";

export function getOutputForBlock(
  outputs: OutputPlaceholder[],
  blockId: string
): OutputPlaceholder | undefined {
  return outputs.find((output) => output.blockId === blockId);
}

export function notebookContentBlockIds(notebook: Notebook): string[] {
  return notebook.blocks.map((block) => block.id);
}

export function outputBlockIds(outputs: OutputPlaceholder[]): string[] {
  return outputs.map((output) => output.blockId);
}

export function hasOutputStoredAsDurableContent(notebook: Notebook): boolean {
  return notebook.blocks.some((block) => "output" in block);
}
