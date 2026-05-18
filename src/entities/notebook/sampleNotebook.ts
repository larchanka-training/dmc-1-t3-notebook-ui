import type { Notebook } from "./types";
import type { OutputPlaceholder } from "../output/types";

export const sampleNotebook: Notebook = {
  id: "nb_jsnb_50",
  title: "JavaScript Notebook Draft",
  revision: 1,
  createdAt: "2026-05-18T10:00:00.000Z",
  updatedAt: "2026-05-18T10:15:00.000Z",
  blocks: [
    {
      id: "blk_intro",
      type: "text",
      content: {
        markdown:
          "## Explore order totals\nUse Markdown notes to explain the intent before running JavaScript examples."
      }
    },
    {
      id: "blk_prepare_data",
      type: "code",
      content: {
        language: "javascript",
        source:
          "const orders = [\n  { id: 1, total: 48 },\n  { id: 2, total: 126 },\n  { id: 3, total: 74 }\n];\n\norders.map((order) => order.total);"
      }
    },
    {
      id: "blk_observation",
      type: "text",
      content: {
        markdown:
          "The output stays attached to the code block, but it is not durable notebook content."
      }
    },
    {
      id: "blk_summarize",
      type: "code",
      content: {
        language: "javascript",
        source:
          "const total = orders.reduce((sum, order) => sum + order.total, 0);\nconst average = total / orders.length;\n\n({ total, average });"
      }
    }
  ]
};

export const sampleOutputPlaceholders: OutputPlaceholder[] = [
  {
    blockId: "blk_prepare_data",
    kind: "placeholder",
    label: "Output will appear here after running this block."
  },
  {
    blockId: "blk_summarize",
    kind: "placeholder",
    label: "Object, table, chart, text, or error output placeholder."
  }
];
