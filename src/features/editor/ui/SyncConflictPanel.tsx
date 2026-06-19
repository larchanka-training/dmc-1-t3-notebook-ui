import { Button } from "@/shared/ui";
import { editorSecondaryButtonClass } from "../lib/editorStyles";

type SyncConflictPanelProps = {
  baseRevision: number;
  serverRevision: number | null;
  onReview: () => void;
  onReplace: () => void;
  onKeepLocal: () => void;
  onRetry: () => void;
};

export function SyncConflictPanel({
  baseRevision,
  serverRevision,
  onReview,
  onReplace,
  onKeepLocal,
  onRetry,
}: SyncConflictPanelProps) {
  return (
    <div
      role="alert"
      className="mx-auto mt-4 w-full max-w-5xl rounded-md border border-amber-500/40 bg-amber-50 px-token-24 py-token-12 text-sm text-amber-900 max-md:px-3.5"
    >
      <p className="font-semibold">Sync conflict</p>
      <p className="mt-1">
        Automatic merge was not performed. Your local copy is based on revision{" "}
        {baseRevision}, while the server is at revision {serverRevision ?? "unknown"}.
        Choose how to resolve it.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={onReview}
        >
          Review server version
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={onReplace}
        >
          Replace local with server
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={onKeepLocal}
        >
          Keep local for later
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={editorSecondaryButtonClass}
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
