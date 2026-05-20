import type { NotebookBlock } from "@/entities/notebook";

export type BlockActions = {
  addBlockAfter: (blockId: string, type: NotebookBlock["type"]) => void;
  deleteBlockById: (blockId: string) => void;
  moveBlockById: (blockId: string, direction: "up" | "down") => void;
  runBlock: (blockId: string) => void;
  updateText: (blockId: string, markdown: string) => void;
  updateCode: (blockId: string, source: string) => void;
};
