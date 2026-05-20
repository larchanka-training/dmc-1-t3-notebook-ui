import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded border border-dashed border-border-strong p-token-24 text-center text-sm text-ink-muted">
      {children}
    </p>
  );
}
