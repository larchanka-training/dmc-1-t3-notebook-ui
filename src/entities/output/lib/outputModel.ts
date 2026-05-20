import type { OutputPlaceholder } from "../model/types";

export function getOutputForBlock(
  outputs: OutputPlaceholder[],
  blockId: string,
): OutputPlaceholder | undefined {
  return outputs.find((output) => output.blockId === blockId);
}

export function outputBlockIds(outputs: OutputPlaceholder[]): string[] {
  return outputs.map((output) => output.blockId);
}

export function createOutputPlaceholder(blockId: string): OutputPlaceholder {
  return {
    blockId,
    kind: "placeholder",
    label: "Output will appear here after running this block.",
  };
}
