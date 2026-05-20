import type { OutputPlaceholder } from "../model/types";

type OutputPlaceholderViewProps = {
  blockId: string;
  output?: OutputPlaceholder;
};

export function OutputPlaceholderView({ blockId, output }: OutputPlaceholderViewProps) {
  return (
    <section
      className="border-t border-border-token bg-editor px-token-16 py-token-12"
      aria-label={`Output area for ${blockId}`}
    >
      <span className="text-xs font-semibold text-ink-muted">Output</span>
      <p className="mt-1 text-sm text-ink">
        {output?.label ?? "Output placeholder is intentionally empty."}
      </p>
    </section>
  );
}
