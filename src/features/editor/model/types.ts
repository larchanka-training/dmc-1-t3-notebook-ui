import type { NotebookBlock } from "@/entities/notebook";

export type BlockActions = {
  addBlockBefore: (blockId: string, type: NotebookBlock["type"]) => void;
  addBlockAfter: (blockId: string, type: NotebookBlock["type"]) => void;
  deleteBlockById: (blockId: string) => void;
  moveBlockById: (blockId: string, direction: "up" | "down") => void;
  runAll: () => void;
  runBlock: (blockId: string) => void;
  runFromHere: (blockId: string) => void;
  stopExecution: () => void;
  updateText: (blockId: string, markdown: string) => void;
  updateCode: (blockId: string, source: string) => void;
};
