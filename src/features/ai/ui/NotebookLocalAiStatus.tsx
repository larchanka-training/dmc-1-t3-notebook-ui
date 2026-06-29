import { RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { useNotebookLocalAiStatus } from "../model/useNotebookLocalAiStatus";

type NotebookLocalAiStatusProps = {
  notebookId: string | null;
  serverNotebookId: string | null;
};

function statusTone(
  status: ReturnType<typeof useNotebookLocalAiStatus>["surfaceStatus"],
): string {
  switch (status) {
    case "ready":
      return "bg-[var(--color-accent-success)]";
    case "preparing":
      return "bg-[var(--color-accent-warning)]";
    case "failed":
    case "unsupported":
      return "bg-[var(--color-accent-danger)]";
    default:
      return "bg-[var(--color-text-muted)]";
  }
}

export function NotebookLocalAiStatus(props: NotebookLocalAiStatusProps) {
  const {
    statusLabel,
    summary,
    surfaceStatus,
    canPrepareLocal,
    canResetLocal,
    onPrepareLocalMode,
    onResetLocalMode,
  } = useNotebookLocalAiStatus(props);

  return (
    <div
      className="inline-flex max-w-[22rem] min-w-0 items-center gap-1.5 rounded-full border border-border-token/70 bg-editor/35 px-3 py-1 text-xs text-ink-muted"
      aria-label="Local AI status"
      data-local-ai-status={surfaceStatus}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", statusTone(surfaceStatus))}
        aria-hidden="true"
      />
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
      <span className="whitespace-nowrap font-medium text-ink">Local AI</span>
      {statusLabel ? (
        <span className="truncate whitespace-nowrap text-ink" aria-live="polite">
          {statusLabel}
        </span>
      ) : null}
      {summary ? (
        <span className="truncate" aria-live="polite">
          {summary}
        </span>
      ) : null}
      {canPrepareLocal ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-7 rounded-full border-border-token/80 bg-background/70 px-3 text-ink shadow-none hover:bg-background"
          onClick={() => {
            void onPrepareLocalMode();
          }}
        >
          Prepare WebLLM
        </Button>
      ) : null}
      {canResetLocal ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-7 rounded-full border-border-token/80 bg-background/70 px-2.5 text-ink shadow-none hover:bg-background"
          onClick={() => {
            void onResetLocalMode();
          }}
          aria-label="Reset WebLLM local mode"
          title="Reset WebLLM local mode"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}
