import { useParams } from "react-router-dom";

// Stub only. The notebook editor UI (block list, block types, block
// actions, output area) is built by a separate editor task — this page
// keeps the route + param wiring and renders a placeholder.
export function NotebookEditorPage() {
  const { notebookId } = useParams();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <p className="text-sm text-ink-muted">
        Notebook editor (<span className="font-mono">{notebookId}</span>) — not
        implemented yet.
      </p>
    </div>
  );
}
