import { useAppStore } from "@/app/model";
import { Button } from "@/shared/ui";

export function AppToastHost() {
  const toast = useAppStore((state) => state.appUi.toast);
  const dismissToast = useAppStore((state) => state.dismissToast);

  if (!toast) {
    return null;
  }

  const isError = toast.level === "error";

  return (
    <div
      className="pointer-events-none fixed bottom-token-24 right-token-24 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg ${
          isError
            ? "border-accent-danger/30 bg-surface text-accent-danger"
            : "border-border-token bg-surface text-ink"
        }`}
        role="status"
      >
        <p className="text-sm">{toast.message}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-7 px-2 text-xs"
          onClick={dismissToast}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
