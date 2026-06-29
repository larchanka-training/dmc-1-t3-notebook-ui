import { useRef } from "react";
import { PencilLine } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useNotebookTitleEditor } from "../model/useNotebookTitleEditor";

type NotebookTitleEditorProps = {
  title: string;
  canRename: boolean;
  onRename: (title: string) => Promise<void>;
};

export function NotebookTitleEditor({
  title,
  canRename,
  onRename,
}: NotebookTitleEditorProps) {
  const skipBlurSubmitRef = useRef(false);
  const {
    draftTitle,
    isEditing,
    isSubmitting,
    error,
    startEditing,
    cancelEditing,
    submit,
    setDraftTitle,
  } = useNotebookTitleEditor({
    title,
    canRename,
    onRename,
  });

  if (isEditing) {
    return (
      <form
        className="max-w-3xl"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        onBlur={(event) => {
          if (skipBlurSubmitRef.current) {
            skipBlurSubmitRef.current = false;
            return;
          }

          const nextFocusTarget = event.relatedTarget;
          if (nextFocusTarget && event.currentTarget.contains(nextFocusTarget)) {
            return;
          }

          if (!isSubmitting) {
            void submit();
          }
        }}
      >
        <div className="flex max-w-3xl items-start gap-3">
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="notebook-title-input">
              Notebook title
            </label>
            <Input
              id="notebook-title-input"
              value={draftTitle}
              onChange={(event) => {
                setDraftTitle(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  skipBlurSubmitRef.current = true;
                  cancelEditing();
                }
              }}
              autoFocus
              disabled={isSubmitting}
              aria-invalid={error ? "true" : "false"}
              className="h-auto min-h-14 rounded-2xl px-4 py-3 text-3xl font-semibold tracking-[-0.02em] text-ink md:text-4xl"
            />
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onMouseDown={() => {
                skipBlurSubmitRef.current = true;
              }}
              onClick={cancelEditing}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-accent-danger" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-ink-muted">
          Press Enter to save, Escape to cancel.
        </p>
      </form>
    );
  }

  return (
    <div className="flex max-w-3xl items-start gap-3">
      <h1
        id="notebook-title"
        className="min-w-0 flex-1 text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink"
      >
        {title}
      </h1>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={startEditing}
        disabled={!canRename}
        aria-label="Rename notebook title"
        title={
          canRename
            ? "Rename notebook title"
            : "Notebook title cannot be renamed right now"
        }
        className="mt-1 h-9 w-9 shrink-0"
      >
        <PencilLine aria-hidden="true" />
      </Button>
    </div>
  );
}
