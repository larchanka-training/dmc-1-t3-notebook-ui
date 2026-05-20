import { Link } from "react-router-dom";
import { Button, EmptyState } from "@/shared/ui";
import { useNotebooksList } from "../model/useNotebooksList";

export function NotebooksList() {
  const { items, status, error, onCreateNotebook } = useNotebooksList();

  return (
    <div className="mx-auto max-w-3xl p-token-24">
      <div className="mb-token-24 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Notebooks</h1>
        <Button variant="default" className="px-3 py-1.5" onClick={onCreateNotebook}>
          Create notebook
        </Button>
      </div>

      {status === "loading" && (
        <p className="text-sm text-ink-muted">Loading notebooks…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-accent-danger" role="alert">
          {error ?? "Failed to load notebooks."}
        </p>
      )}
      {status === "idle" && items.length === 0 && (
        <EmptyState>
          No notebooks yet. Click <strong>Create notebook</strong> to start.
        </EmptyState>
      )}
      {status === "idle" && items.length > 0 && (
        <ul className="divide-y divide-border-token rounded border border-border-token bg-surface">
          {items.map((nb) => (
            <li key={nb.id}>
              <Link
                to={`/notebooks/${nb.id}`}
                className="block px-token-16 py-token-12 text-sm text-ink no-underline transition-colors hover:bg-editor focus-visible:bg-editor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              >
                <span className="font-medium">{nb.title}</span>
                <span className="mt-1 block text-xs text-ink-muted">
                  Updated {new Date(nb.updatedAt).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
