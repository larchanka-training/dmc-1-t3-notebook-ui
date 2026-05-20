import type { OutputPlaceholder } from "../model/types";

export const sampleOutputPlaceholders: OutputPlaceholder[] = [
  {
    blockId: "blk_prepare_data",
    kind: "placeholder",
    label: "Output will appear here after running this block.",
  },
  {
    blockId: "blk_summarize",
    kind: "placeholder",
    label: "Object, table, chart, text, or error output placeholder.",
  },
];
