import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded border border-dashed border-ink/15 p-6 text-center text-sm text-ink-muted">
      {children}
    </p>
  );
}
