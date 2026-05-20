export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span
        role="img"
        aria-label="JS Notebook logo"
        className="inline-flex h-8 w-8 items-center justify-center rounded bg-[var(--color-accent-primary)] text-sm font-semibold text-white"
      >
        JS
      </span>
      <span className="text-base font-semibold tracking-tight">JS Notebook</span>
    </div>
  );
}
