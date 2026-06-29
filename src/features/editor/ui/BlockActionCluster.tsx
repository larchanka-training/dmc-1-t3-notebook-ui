import type { NotebookBlock } from "@/entities/notebook";
import { Trash2, MoveUp, MoveDown, Braces, Type } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { BlockActions } from "../model/types";

type BlockActionClusterProps = {
  block: NotebookBlock;
  isFirst: boolean;
  isLast: boolean;
  actions: BlockActions;
  executionState: {
    isRunning: boolean;
    isTarget: boolean;
    executionOrder: number | null;
    canRun: boolean;
    canRunFromHere: boolean;
    canStop: boolean;
  };
};

type IconButtonProps = {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
};

function ToolbarIconButton({
  label,
  title,
  disabled = false,
  onClick,
  children,
  variant = "default",
  className,
}: IconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        "h-6 w-6 min-h-0 p-0",
        variant === "destructive"
          ? "text-ink-muted hover:bg-destructive/8 hover:text-destructive"
          : "text-ink-muted hover:bg-surface hover:text-ink",
        className,
      )}
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function BlockActionCluster({
  block,
  isFirst,
  isLast,
  actions,
  executionState,
}: BlockActionClusterProps) {
  const blockTypeLabel = block.type === "text" ? "Text block" : "Code block";

  return (
    <div
      className={cn(
        "absolute right-2 top-1.5 z-[2] inline-flex items-center gap-0.5 rounded-md border border-border-token/40 bg-surface/95 p-0.5 shadow-sm",
      )}
      aria-label={`Actions for ${block.id}`}
    >
      <div className="inline-flex items-center gap-1 rounded-[calc(var(--radius)-2px)] bg-editor/42 px-2 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted">
        {block.type === "text" ? (
          <Type className="size-3" aria-hidden="true" />
        ) : (
          <Braces className="size-3" aria-hidden="true" />
        )}
        <span>{blockTypeLabel}</span>
      </div>
      <ToolbarIconButton
        label={`Move ${block.id} up`}
        title="Move up"
        disabled={isFirst || !executionState.canRun}
        onClick={() => actions.moveBlockById(block.id, "up")}
      >
        <MoveUp className="size-3.5" aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton
        label={`Move ${block.id} down`}
        title="Move down"
        disabled={isLast || !executionState.canRun}
        onClick={() => actions.moveBlockById(block.id, "down")}
      >
        <MoveDown className="size-3.5" aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton
        label={`Delete ${block.id}`}
        title="Delete block"
        disabled={!executionState.canRun}
        onClick={() => actions.deleteBlockById(block.id)}
        variant="destructive"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </ToolbarIconButton>
    </div>
  );
}
