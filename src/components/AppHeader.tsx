import { Link } from "react-router-dom";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-surface px-6">
      <div className="flex items-center gap-2">
        <span
          role="img"
          aria-label="JS Notebook logo"
          className="inline-flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-semibold text-white"
        >
          JS
        </span>
        <span className="text-base font-semibold tracking-tight">
          JS Notebook
        </span>
      </div>
      <nav aria-label="Primary">
        <ul className="flex items-center gap-4 text-sm">
          <li>
            <Link
              to="/notebooks"
              className="text-ink-muted hover:text-ink"
            >
              Notebooks
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
