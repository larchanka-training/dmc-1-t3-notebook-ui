import { Button, Card, EmptyState } from "@/shared/ui";
import { useNotebooksList } from "../model/useNotebooksList";
import type { NotebookListItem, NotebookOrigin } from "../model/mergeNotebookList";

const ORIGIN_LABEL: Record<NotebookOrigin, string> = {
  "local-only": "Local only",
  synced: "Synced",
  "remote-only": "On server",
};

function originBadgeClass(origin: NotebookOrigin): string {
  switch (origin) {
    case "synced":
      return "bg-accent-primary/10 text-accent-primary";
    case "remote-only":
      return "bg-editor text-ink-muted";
    default:
      return "bg-surface text-ink-muted";
  }
}

function itemKey(item: NotebookListItem): string {
  return item.id ?? `server-${item.serverId}`;
}

export function NotebooksList() {
  const { items, status, error, onCreateNotebook, onOpen } = useNotebooksList();

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
        <Card className="overflow-hidden rounded-lg border-border-token bg-surface shadow-sm">
          <ul className="divide-y divide-border-token">
            {items.map((nb) => (
              <li key={itemKey(nb)}>
                <button
                  type="button"
                  onClick={() => {
                    void onOpen(nb);
                  }}
                  className="block w-full px-token-16 py-token-12 text-left text-sm text-ink transition-colors hover:bg-editor focus-visible:bg-editor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{nb.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${originBadgeClass(nb.origin)}`}
                      data-testid="notebook-origin"
                    >
                      {ORIGIN_LABEL[nb.origin]}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    Updated {new Date(nb.updatedAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
