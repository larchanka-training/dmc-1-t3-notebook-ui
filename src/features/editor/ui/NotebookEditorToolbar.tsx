import { Link } from "react-router-dom";
import type { Notebook } from "@/entities/notebook";
import { Button } from "@/shared/ui";
import { editorSecondaryButtonClass } from "../lib/editorStyles";
import type { BlockActions } from "../model/types";

type NotebookEditorToolbarProps = {
  notebook: Notebook;
  lastBlockId: string;
  actions: BlockActions;
};

export function NotebookEditorToolbar({
  notebook,
  lastBlockId,
  actions,
}: NotebookEditorToolbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-token bg-surface/95 px-token-24 py-token-12 backdrop-blur-md max-md:flex-col max-md:items-start">
      <div>
        <Link
          to="/notebooks"
          className="text-sm font-semibold text-ink-muted no-underline hover:text-ink"
          aria-label="Back to notebooks"
        >
          Notebooks
        </Link>
        <span className="ml-2 text-sm text-ink-muted" aria-hidden="true">
          /
        </span>
        <span className="ml-2 text-sm font-semibold text-ink">{notebook.title}</span>
      </div>
      <div
        className="flex flex-wrap justify-end gap-2 max-md:justify-start"
        aria-label="Notebook actions"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={() => actions.addBlockAfter(lastBlockId, "text")}
        >
          Add text block
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={() => actions.addBlockAfter(lastBlockId, "code")}
        >
          Add code block
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          disabled
        >
          Sync placeholder
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          disabled
        >
          Run all placeholder
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          disabled
        >
          Export placeholder
        </Button>
      </div>
    </header>
  );
}
