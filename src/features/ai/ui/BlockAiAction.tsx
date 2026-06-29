import { Sparkle, Sparkles } from "lucide-react";
import type { BlockAiActionProps } from "../model/types";
import { useBlockAiAction } from "../model/useBlockAiAction";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function BlockAiAction(props: BlockAiActionProps) {
  const {
    status,
    isSubmitting,
    canGenerate,
    localModeEnabled,
    canGenerateLocally,
    canRetryLocally,
    warnings,
    errorSummary,
    onGenerate,
    onGenerateLocally,
  } = useBlockAiAction(props);

  const hasSurface =
    status === "submitting" || status === "error" || warnings.length > 0;

  const secondaryAiAction = localModeEnabled
    ? canGenerateLocally
      ? {
          label: `Generate code locally from ${props.block.id}`,
          title: canRetryLocally ? "Retry locally with WebLLM" : "Generate locally",
          disabled: isSubmitting,
          onClick: onGenerateLocally,
          icon: <Sparkle aria-hidden="true" />,
          className:
            "min-h-8 w-8 border border-border-token/45 bg-transparent px-0 text-ink-muted opacity-85 hover:border-border-strong hover:bg-surface hover:text-ink hover:opacity-100",
        }
      : null
    : null;

  return (
    <section className="mt-3" aria-label={`AI action for ${props.block.id}`}>
      <div className="absolute -left-10 top-3 z-[1] flex w-8 flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn("min-h-8 w-8 px-0")}
          aria-label={`Generate code from ${props.block.id}`}
          title={isSubmitting ? "Generating..." : "Generate code"}
          disabled={!canGenerate}
          onClick={onGenerate}
        >
          <Sparkles aria-hidden="true" />
        </Button>
        {secondaryAiAction ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={secondaryAiAction.className}
            aria-label={secondaryAiAction.label}
            title={secondaryAiAction.title}
            disabled={secondaryAiAction.disabled}
            onClick={secondaryAiAction.onClick}
          >
            {secondaryAiAction.icon}
          </Button>
        ) : null}
      </div>

      {hasSurface ? (
        <div className="min-w-0 rounded-md border border-border-token/45 bg-app/28 px-3 py-3">
          <section aria-label={`AI detail for ${props.block.id}`}>
            {status === "submitting" ? (
              <p className="rounded-md border border-border-token/45 bg-surface/65 px-3 py-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-muted">
                Generating...
              </p>
            ) : null}
            {status === "error" && errorSummary ? (
              <p
                className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-xs text-destructive"
                role="alert"
              >
                {errorSummary}
              </p>
            ) : null}
            {warnings.length > 0 ? (
              <ul
                className="mt-2 rounded-md border border-[var(--color-accent-warning)]/25 bg-[var(--color-accent-warning)]/8 px-2.5 py-2 text-xs text-ink"
                aria-label={`AI warnings for ${props.block.id}`}
              >
                {warnings.map((warning) => (
                  <li key={warning.code}>
                    {warning.code}: {warning.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}
