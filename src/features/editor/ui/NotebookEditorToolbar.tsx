import type { ReactNode } from "react";
import { Cloud, FileText, Play, Square } from "lucide-react";
import type { NotebookSyncStatus } from "@/entities/notebook";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { editorSecondaryButtonClass } from "../lib/editorStyles";
import type { BlockActions } from "../model/types";

type NotebookEditorToolbarProps = {
  lastBlockId: string;
  actions: BlockActions;
  executionMessage: string;
  executionStatus: string;
  canStartExecution: boolean;
  canStopExecution: boolean;
  syncStatus: NotebookSyncStatus;
  onSync: () => void;
  statusSupplement?: ReactNode;
};

function syncStatusLabel(status: NotebookSyncStatus): string {
  switch (status) {
    case "syncing":
      return "Syncing…";
    case "synced":
      return "Synced";
    case "conflict":
      return "Sync conflict";
    case "error":
      return "Sync error";
    default:
      return "Unsynced";
  }
}

function runtimeStatusTone(status: string): string {
  switch (status) {
    case "running":
      return "bg-[var(--color-accent-warning)]";
    case "error":
    case "timeout":
    case "canceled":
      return "bg-[var(--color-accent-danger)]";
    default:
      return "bg-[var(--color-accent-success)]";
  }
}

export function NotebookEditorToolbar({
  lastBlockId,
  actions,
  executionMessage,
  executionStatus,
  canStartExecution,
  canStopExecution,
  syncStatus,
  onSync,
  statusSupplement,
}: NotebookEditorToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-token bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(64,50,29,0.06)]"
      aria-label="Notebook top bar actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(editorSecondaryButtonClass, "gap-2 rounded-xl px-3")}
          disabled={!canStartExecution}
          onClick={() => actions.addBlockAfter(lastBlockId, "text")}
          aria-label="Add text block"
          title="Add text block"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Add text
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(editorSecondaryButtonClass, "gap-2 rounded-xl px-3")}
          disabled={!canStartExecution}
          onClick={() => actions.addBlockAfter(lastBlockId, "code")}
          aria-label="Add JavaScript code block"
          title="Add JavaScript code block"
        >
          <span
            className="font-mono text-xs font-semibold tracking-tight"
            aria-hidden="true"
          >
            {"{ }"}
          </span>
          Add code
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(editorSecondaryButtonClass, "gap-2 rounded-xl px-3")}
          disabled={!canStartExecution}
          onClick={() => actions.runAll()}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Run all
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(editorSecondaryButtonClass, "gap-2 rounded-xl px-3")}
          disabled={!canStopExecution}
          onClick={() => actions.stopExecution()}
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          Stop
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(editorSecondaryButtonClass, "gap-2 rounded-xl px-3")}
          onClick={onSync}
          disabled={syncStatus === "syncing"}
        >
          <Cloud className="h-4 w-4" aria-hidden="true" />
          Sync
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-border-token/70 bg-editor/55 px-3 py-1.5 text-xs text-ink-muted"
          aria-label="Sync status"
          data-testid="sync-status"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              syncStatus === "synced"
                ? "bg-[var(--color-accent-success)]"
                : syncStatus === "syncing"
                  ? "bg-[var(--color-accent-warning)]"
                  : syncStatus === "conflict" || syncStatus === "error"
                    ? "bg-[var(--color-accent-danger)]"
                    : "bg-[var(--color-text-muted)]",
            )}
            aria-hidden="true"
          />
          <span className="font-medium text-ink">Sync status</span>
          <span>{syncStatusLabel(syncStatus)}</span>
        </div>
        <div
          className="inline-flex max-w-[18rem] items-center gap-2 rounded-full border border-border-token/70 bg-editor/35 px-3 py-1.5 text-xs text-ink-muted"
          aria-label="Runtime status"
          data-execution-status={executionStatus}
        >
          <span
            className={cn("h-2 w-2 rounded-full", runtimeStatusTone(executionStatus))}
            aria-hidden="true"
          />
          <span className="font-medium text-ink">Runtime status</span>
          <span className="truncate" aria-live="polite">
            {executionMessage}
          </span>
        </div>
        {statusSupplement}
      </div>
    </div>
  );
}
