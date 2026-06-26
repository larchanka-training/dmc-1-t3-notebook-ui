import type { ReactNode } from "react";
import type { Notebook, NotebookBlock, NotebookSyncMeta } from "@/entities/notebook";

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
  applyGeneratedCode: (sourceBlockId: string, source: string) => void;
};

export type NotebookBlockRenderArgs = {
  notebook: Notebook;
  syncMeta: NotebookSyncMeta;
  block: NotebookBlock;
  index: number;
  blockCount: number;
  actions: BlockActions;
};

export type NotebookBlockRender = (args: NotebookBlockRenderArgs) => ReactNode;
