import { useAppStore } from "../store";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

export function NotebooksListPage() {
  const { items, status, error } = useAppStore((s) => s.notebookList);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notebooks</h1>
        <Button variant="primary" className="px-3 py-1.5">
          Create notebook
        </Button>
      </div>

      {status === "loading" && (
        <p className="text-sm text-ink-muted">Loading notebooks…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {error ?? "Failed to load notebooks."}
        </p>
      )}
      {status === "idle" && items.length === 0 && (
        <EmptyState>
          No notebooks yet. Click <strong>Create notebook</strong> to start.
        </EmptyState>
      )}
      {status === "idle" && items.length > 0 && (
        <ul className="divide-y divide-ink/10 rounded border border-ink/10">
          {items.map((nb) => (
            <li key={nb.id} className="px-4 py-3 text-sm">
              {nb.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
