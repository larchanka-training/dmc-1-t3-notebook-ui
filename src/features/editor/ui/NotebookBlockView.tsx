import type { NotebookBlock } from "@/entities/notebook";
import type { ReactNode } from "react";
import { ArrowDownToLine, CirclePlay, Square } from "lucide-react";
import { CodeBlockEditor, TextBlockEditor } from "@/entities/block";
import { OutputView } from "@/entities/output";
import type { OutputItem } from "@/entities/output";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import type { BlockActions } from "../model/types";
import { editorRunButtonClass, editorSecondaryButtonClass } from "../lib/editorStyles";
import { BlockActionCluster } from "./BlockActionCluster";

type NotebookBlockViewProps = {
  block: NotebookBlock;
  index: number;
  blockCount: number;
  isSelected: boolean;
  outputs?: OutputItem[];
  actions: BlockActions;
  executionState: {
    isRunning: boolean;
    isTarget: boolean;
    executionOrder: number | null;
    canRun: boolean;
    canRunFromHere: boolean;
    canStop: boolean;
  };
  onSelect: (blockId: string) => void;
  actionSupplement?: ReactNode;
};

export function NotebookBlockView({
  block,
  index,
  blockCount,
  isSelected,
  outputs,
  actions,
  executionState,
  onSelect,
  actionSupplement,
}: NotebookBlockViewProps) {
  return (
    <article
      onMouseDownCapture={() => onSelect(block.id)}
      onFocusCapture={() => onSelect(block.id)}
      className={cn(
        "group relative grid overflow-visible rounded-[var(--block-radius)] border border-border-token/55 bg-surface md:grid-cols-[3.5rem_minmax(0,1fr)]",
        "transition-colors duration-150 hover:border-border-token/80",
        isSelected
          ? "border-[var(--color-accent-primary)]/35 shadow-[0_0_0_2px_rgba(157,107,43,0.08)]"
          : "focus-within:border-[var(--color-accent-primary)]/35 focus-within:shadow-[0_0_0_2px_rgba(157,107,43,0.08)]",
      )}
    >
      <aside
        className="flex min-h-full flex-row items-stretch justify-between gap-2 border-b border-border-token/25 bg-editor/32 px-2 py-2 md:flex-col md:items-center md:justify-start md:border-b-0 md:border-r md:px-1.5 md:py-3"
        aria-label={`Block gutter for ${block.id}`}
      >
        {block.type === "code" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className={cn(
                "min-h-8 w-8 px-0",
                executionState.isRunning
                  ? editorRunButtonClass
                  : editorSecondaryButtonClass,
              )}
              aria-label={`Run ${block.id}`}
              title={executionState.isRunning ? "Running" : "Run"}
              disabled={!executionState.canRun}
              onClick={() => actions.runBlock(block.id)}
            >
              <CirclePlay aria-hidden="true" />
            </Button>
            {isSelected ? (
              executionState.canStop ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="min-h-8 w-8 border border-destructive/25 bg-destructive/5 px-0 text-destructive hover:bg-destructive/10"
                  aria-label={`Stop ${block.id} from gutter`}
                  title="Stop"
                  onClick={() => actions.stopExecution()}
                >
                  <Square aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className={cn(
                    "min-h-8 w-8 border border-border-token/45 bg-transparent px-0 text-ink-muted opacity-85 hover:border-border-strong hover:bg-surface hover:text-ink hover:opacity-100",
                    editorSecondaryButtonClass,
                  )}
                  aria-label={`Run from here ${block.id} from gutter`}
                  title="Run from here"
                  disabled={!executionState.canRunFromHere}
                  onClick={() => actions.runFromHere(block.id)}
                >
                  <ArrowDownToLine aria-hidden="true" />
                </Button>
              )
            ) : null}
          </>
        ) : null}
        {block.type === "code" ? (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-md border px-2 py-1 text-[0.6875rem] font-medium tabular-nums md:mt-auto md:min-h-8 md:min-w-8 md:px-0",
              executionState.isRunning
                ? "border-blue-500/30 bg-blue-50/80 text-blue-700"
                : executionState.executionOrder !== null
                  ? "border-[var(--color-accent-success)]/35 bg-[var(--color-accent-success)]/10 text-[var(--color-accent-success)]"
                  : "border-border-token/35 bg-surface/72 text-ink-secondary",
            )}
            aria-label={
              executionState.executionOrder !== null
                ? `Execution order ${executionState.executionOrder} for ${block.id}`
                : `Execution order empty for ${block.id}`
            }
            title={
              executionState.executionOrder !== null
                ? `Run #${executionState.executionOrder}`
                : "Not executed yet"
            }
          >
            {executionState.executionOrder ?? ""}
          </span>
        ) : null}
      </aside>

      <div className="relative overflow-visible bg-surface">
        <BlockActionCluster
          block={block}
          isFirst={index === 0}
          isLast={index === blockCount - 1}
          actions={actions}
          executionState={executionState}
        />
        <div
          className={cn(block.type === "text" ? "overflow-visible" : "overflow-hidden")}
        >
          {block.type === "text" ? (
            <>
              <TextBlockEditor
                block={block}
                onChange={(markdown) => actions.updateText(block.id, markdown)}
              />
              {isSelected ? actionSupplement : null}
            </>
          ) : (
            <div aria-label="JavaScript code block">
              <CodeBlockEditor
                block={block}
                onChange={(source) => actions.updateCode(block.id, source)}
              />
              <OutputView blockId={block.id} outputs={outputs} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
