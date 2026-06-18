import { Sparkles } from "lucide-react";
import type { BlockAiActionProps } from "../model/types";
import { useBlockAiAction } from "../model/useBlockAiAction";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function BlockAiAction(props: BlockAiActionProps) {
  const {
    status,
    statusLabel,
    scope,
    isSubmitting,
    canGenerate,
    successPreview,
    warnings,
    errorSummary,
    requestId,
    onGenerate,
  } = useBlockAiAction(props);

  return (
    <div
      className="flex min-w-[14rem] max-w-[18rem] flex-col gap-2 rounded-md border border-border-token/70 bg-surface/95 p-2"
      aria-label={`AI action for ${props.block.id}`}
    >
      <Button
        type="button"
        variant="outline"
        size="xs"
        className={cn("justify-start text-left")}
        aria-label={`Generate code from ${props.block.id}`}
        disabled={!canGenerate}
        onClick={onGenerate}
      >
        <Sparkles aria-hidden="true" />
        {isSubmitting ? "Generating..." : "Generate code"}
      </Button>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {statusLabel} · scope: {scope}
      </p>
      {status === "error" && errorSummary ? (
        <p className="text-xs text-destructive" role="alert">
          {errorSummary}
        </p>
      ) : null}
      {status === "success" && successPreview ? (
        <div
          className="rounded-md border border-border-token/70 bg-app/60 p-2"
          aria-label={`Generated code preview for ${props.block.id}`}
        >
          <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Generated draft
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-ink">
            <code>{successPreview}</code>
          </pre>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <ul
          className="text-xs text-ink-muted"
          aria-label={`AI warnings for ${props.block.id}`}
        >
          {warnings.map((warning) => (
            <li key={warning.code}>
              {warning.code}: {warning.message}
            </li>
          ))}
        </ul>
      ) : null}
      {requestId ? (
        <p className="text-[0.6875rem] text-ink-muted">Request: {requestId}</p>
      ) : null}
    </div>
  );
}
