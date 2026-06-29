import type { KeyboardEvent } from "react";
import { Braces, Plus, Type } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import type { NotebookBlock } from "@/entities/notebook";
import type { BlockActions } from "../model/types";

type InsertBlockDividerProps = {
  previousBlockId: string | null;
  nextBlockId: string | null;
  actions: BlockActions;
};

function buildDividerLabel(previousBlockId: string | null, nextBlockId: string | null) {
  if (previousBlockId && nextBlockId) {
    return `Insert block between ${previousBlockId} and ${nextBlockId}`;
  }

  if (nextBlockId) {
    return `Insert block before ${nextBlockId}`;
  }

  if (previousBlockId) {
    return `Insert block after ${previousBlockId}`;
  }

  return "Insert block";
}

export function InsertBlockDivider({
  previousBlockId,
  nextBlockId,
  actions,
}: InsertBlockDividerProps) {
  const insertBlock = (type: NotebookBlock["type"]) => {
    if (previousBlockId) {
      actions.addBlockAfter(previousBlockId, type);
      return;
    }

    if (nextBlockId) {
      actions.addBlockBefore(nextBlockId, type);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    insertBlock("text");
  };

  return (
    <div className="group/divider relative h-10" aria-hidden="false">
      <div
        role="button"
        tabIndex={0}
        aria-label={buildDividerLabel(previousBlockId, nextBlockId)}
        className="absolute inset-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]/30"
        onKeyDown={handleKeyDown}
      />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-3">
        <div className="h-px bg-transparent transition-colors duration-150 group-hover/divider:bg-border-token/55 group-focus-within/divider:bg-border-token/55" />
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
        )}
      >
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-transparent bg-surface/98 px-1.5 py-1 opacity-0 shadow-none transition-all duration-150 group-hover/divider:border-border-token/40 group-hover/divider:opacity-100 group-focus-within/divider:border-border-token/40 group-focus-within/divider:opacity-100 group-hover/divider:shadow-[0_8px_18px_rgba(64,50,29,0.05)] group-focus-within/divider:shadow-[0_8px_18px_rgba(64,50,29,0.05)]">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="border-border-token/40 bg-surface/70 text-ink-muted opacity-90 transition-colors duration-150 hover:border-border-strong hover:bg-surface hover:text-ink focus-visible:border-border-strong focus-visible:bg-surface focus-visible:text-ink"
            aria-label={`${buildDividerLabel(previousBlockId, nextBlockId)} as text`}
            onClick={() => insertBlock("text")}
          >
            <Plus aria-hidden="true" />
            <Type aria-hidden="true" className="size-3.5" />
            <span>Text</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="border-border-token/40 bg-surface/70 text-ink-muted opacity-90 transition-colors duration-150 hover:border-border-strong hover:bg-surface hover:text-ink focus-visible:border-border-strong focus-visible:bg-surface focus-visible:text-ink"
            aria-label={`${buildDividerLabel(previousBlockId, nextBlockId)} as code`}
            onClick={() => insertBlock("code")}
          >
            <Plus aria-hidden="true" />
            <Braces aria-hidden="true" className="size-3.5" />
            <span>Code</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
