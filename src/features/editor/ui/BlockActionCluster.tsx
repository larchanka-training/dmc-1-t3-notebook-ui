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
  executionState: {
    isRunning: boolean;
    isTarget: boolean;
    canRun: boolean;
    canRunFromHere: boolean;
    canStop: boolean;
  };
};

export function BlockActionCluster({
  block,
  isFirst,
  isLast,
  actions,
  executionState,
}: BlockActionClusterProps) {
  return (
    <div
      className="sticky top-[4.75rem] flex flex-wrap justify-end gap-1 opacity-72 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:static max-md:order-2 max-md:w-full max-md:justify-start"
      aria-label={`Actions for ${block.id}`}
    >
      <div className="contents" aria-label={`Add block above ${block.id}`}>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add text block above ${block.id}`}
          disabled={!executionState.canRun}
          onClick={() => actions.addBlockBefore(block.id, "text")}
        >
          + Text ↑
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add code block above ${block.id}`}
          disabled={!executionState.canRun}
          onClick={() => actions.addBlockBefore(block.id, "code")}
        >
          + Code ↑
        </Button>
      </div>
      <div className="contents" aria-label={`Add block below ${block.id}`}>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add text block below ${block.id}`}
          disabled={!executionState.canRun}
          onClick={() => actions.addBlockAfter(block.id, "text")}
        >
          + Text ↓
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
          aria-label={`Add code block below ${block.id}`}
          disabled={!executionState.canRun}
          onClick={() => actions.addBlockAfter(block.id, "code")}
        >
          + Code ↓
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className={cn(editorSecondaryButtonClass, blockActionButtonClass)}
        aria-label={`Move ${block.id} up`}
        disabled={isFirst || !executionState.canRun}
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
        disabled={isLast || !executionState.canRun}
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
        disabled={!executionState.canRun}
        onClick={() => actions.deleteBlockById(block.id)}
      >
        Delete
      </Button>
      {block.type === "code" ? (
        <>
          {executionState.isRunning || executionState.isTarget ? (
            <span
              className="inline-flex min-h-8 items-center rounded-md border border-border-token/80 bg-surface px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted"
              aria-label={`Execution state for ${block.id}`}
            >
              {executionState.isRunning ? "Running" : "Queued"}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="xs"
            className={cn(editorRunButtonClass, blockActionButtonClass)}
            aria-label={`Run ${block.id}`}
            disabled={!executionState.canRun}
            onClick={() => actions.runBlock(block.id)}
          >
            Run
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className={cn(editorRunButtonClass, blockActionButtonClass)}
            aria-label={`Run from here ${block.id}`}
            disabled={!executionState.canRunFromHere}
            onClick={() => actions.runFromHere(block.id)}
          >
            From here
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className={cn(editorRunButtonClass, blockActionButtonClass)}
            aria-label={`Stop ${block.id}`}
            disabled={!executionState.canStop}
            onClick={() => actions.stopExecution()}
          >
            Stop
          </Button>
        </>
      ) : null}
    </div>
  );
}
