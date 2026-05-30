import { useEffect, useState } from "react";
import {
  createCodeBlock,
  createTextBlock,
  deleteBlock,
  insertBlockAfter,
  insertBlockBefore,
  moveBlock,
  notebookContentBlockIds,
  updateCodeBlockSource,
  updateTextBlockMarkdown,
} from "@/entities/notebook";
import type { NotebookBlock } from "@/entities/notebook";
import { sampleNotebook } from "@/entities/notebook";
import {
  createOutputPlaceholder,
  getOutputForBlock,
  outputBlockIds,
  sampleOutputPlaceholders,
} from "@/entities/output";
import type { OutputPlaceholder } from "@/entities/output";
import type { BlockActions } from "./types";

function notebookForRoute(notebookId: string | null) {
  if (!notebookId) {
    return sampleNotebook;
  }

  return {
    ...sampleNotebook,
    id: notebookId,
    title:
      notebookId === sampleNotebook.id
        ? sampleNotebook.title
        : `Notebook ${notebookId}`,
  };
}

export function useNotebookEditor(notebookId: string | null) {
  const [notebook, setNotebook] = useState(() => notebookForRoute(notebookId));
  const [outputs, setOutputs] = useState(sampleOutputPlaceholders);
  const [nextBlockNumber, setNextBlockNumber] = useState(1);

  useEffect(() => {
    setNotebook(notebookForRoute(notebookId));
    setOutputs(sampleOutputPlaceholders);
    setNextBlockNumber(1);
  }, [notebookId]);

  const createBlockId = (type: NotebookBlock["type"]) => {
    const blockId = `blk_new_${type}_${nextBlockNumber}`;
    setNextBlockNumber((current) => current + 1);
    return blockId;
  };

  const insertBlock = (
    blockId: string,
    type: NotebookBlock["type"],
    position: "before" | "after",
  ) => {
    const newBlockId = createBlockId(type);
    const newBlock =
      type === "text" ? createTextBlock(newBlockId) : createCodeBlock(newBlockId);
    const insert = position === "before" ? insertBlockBefore : insertBlockAfter;

    setNotebook((currentNotebook) => ({
      ...currentNotebook,
      blocks: insert(currentNotebook.blocks, blockId, newBlock),
    }));

    if (newBlock.type === "code") {
      setOutputs((currentOutputs) => [
        ...currentOutputs,
        createOutputPlaceholder(newBlock.id),
      ]);
    }
  };

  const actions: BlockActions = {
    addBlockBefore: (blockId, type) => insertBlock(blockId, type, "before"),
    addBlockAfter: (blockId, type) => insertBlock(blockId, type, "after"),
    deleteBlockById: (blockId) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: deleteBlock(currentNotebook.blocks, blockId),
      }));
      setOutputs((currentOutputs) =>
        currentOutputs.filter((output) => output.blockId !== blockId),
      );
    },
    moveBlockById: (blockId, direction) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: moveBlock(currentNotebook.blocks, blockId, direction),
      }));
    },
    runBlock: (blockId) => {
      setOutputs((currentOutputs) =>
        currentOutputs.map((output) =>
          output.blockId === blockId
            ? {
                ...output,
                label:
                  "Run requested. Execution is intentionally out of scope for this task.",
              }
            : output,
        ),
      );
    },
    updateText: (blockId, markdown) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateTextBlockMarkdown(currentNotebook.blocks, blockId, markdown),
      }));
    },
    updateCode: (blockId, source) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateCodeBlockSource(currentNotebook.blocks, blockId, source),
      }));
    },
  };

  const contentBlockIds = notebookContentBlockIds(notebook);
  const boundOutputIds = outputBlockIds(outputs);
  const lastBlockId = contentBlockIds[contentBlockIds.length - 1] ?? "";

  const getOutput = (blockId: string): OutputPlaceholder | undefined =>
    getOutputForBlock(outputs, blockId);

  return {
    notebookId,
    notebook,
    actions,
    contentBlockIds,
    boundOutputIds,
    lastBlockId,
    getOutput,
  };
}
