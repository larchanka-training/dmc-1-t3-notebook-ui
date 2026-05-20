import type { NotebookBlock } from "@/entities/notebook";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import {
  blockActionButtonClass,
  editorRunButtonClass,
  editorSecondaryButtonClass,
} from "../lib/editorStyles";
import type { BlockActions } from "../model/types";

type BlockActionClusterProps = {
  block: NotebookBlock;
  isFirst: boolean;
  isLast: boolean;
  actions: BlockActions;
};

export function BlockActionCluster({
  block,
  isFirst,
  isLast,
  actions,
}: BlockActionClusterProps) {
  return (
    <div
      className="sticky top-[4.75rem] flex flex-wrap justify-end gap-1 opacity-72 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:static max-md:order-2 max-md:w-full max-md:justify-start"
      aria-label={`Actions for ${block.id}`}
    >
      <div className="contents" aria-label={`Add block after ${block.id}`}>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add text block after ${block.id}`}
          onClick={() => actions.addBlockAfter(block.id, "text")}
        >
          + Text
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add code block after ${block.id}`}
          onClick={() => actions.addBlockAfter(block.id, "code")}
        >
          + Code
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
        aria-label={`Move ${block.id} up`}
        disabled={isFirst}
        onClick={() => actions.moveBlockById(block.id, "up")}
      >
        Up
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
        aria-label={`Move ${block.id} down`}
        disabled={isLast}
        onClick={() => actions.moveBlockById(block.id, "down")}
      >
        Down
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
        aria-label={`Delete ${block.id}`}
        onClick={() => actions.deleteBlockById(block.id)}
      >
        Delete
      </Button>
      {block.type === "code" ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorRunButtonClass, blockActionButtonClass)}
          aria-label={`Run ${block.id}`}
          onClick={() => actions.runBlock(block.id)}
        >
          Run
        </Button>
      ) : null}
    </div>
  );
}
