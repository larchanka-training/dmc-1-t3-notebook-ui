import {
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogOut,
  Plus,
  Rows3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { useNotebookSidebar } from "../model/useNotebookSidebar";

type NotebookSidebarProps = {
  activeNotebookId: string | null;
  activeUtilityPath?: "notebooks" | "help" | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onLogout?: () => void;
  logoutPending?: boolean;
};

export function NotebookSidebar({
  activeNotebookId,
  activeUtilityPath = null,
  collapsed,
  onToggleCollapsed,
  onLogout,
  logoutPending = false,
}: NotebookSidebarProps) {
  const {
    notebookCount,
    activeUtilityPath: resolvedActiveUtilityPath,
    items,
    user,
    status,
    error,
    onCreateNotebook,
    onOpen,
    onToggleCollapsed: toggleCollapsed,
  } = useNotebookSidebar({
    activeNotebookId,
    activeUtilityPath,
    collapsed,
    onToggleCollapsed,
  });

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r border-border-token bg-background transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-72",
      )}
      aria-label="Notebook navigation"
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border-token px-3",
          collapsed ? "justify-center" : "justify-end",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleCollapsed}
          aria-label={
            collapsed ? "Expand notebook sidebar" : "Collapse notebook sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="border-b border-border-token px-2 py-3">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-10 rounded-lg",
            collapsed
              ? "w-full px-0"
              : "w-full justify-start gap-2 text-ink-muted hover:text-ink",
          )}
          onClick={onCreateNotebook}
          aria-label="Create notebook"
          title="Add notebook"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {!collapsed ? <span>New notebook</span> : null}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {!collapsed ? (
          <div className="mb-3 px-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              Your notebooks
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {notebookCount} {notebookCount === 1 ? "item" : "items"}
            </p>
          </div>
        ) : null}

        {status === "loading" ? (
          <p
            className={cn(
              "text-xs text-ink-muted",
              collapsed ? "px-0 text-center" : "px-2 py-2",
            )}
          >
            Loading…
          </p>
        ) : null}

        {status === "error" ? (
          <p
            className={cn(
              "text-xs text-accent-danger",
              collapsed ? "px-0 text-center" : "px-2 py-2",
            )}
            role="alert"
          >
            {collapsed ? "!" : (error ?? "Failed to load notebooks.")}
          </p>
        ) : null}
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    void onOpen(item);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                    collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
                    item.isActive
                      ? "bg-surface text-ink shadow-sm ring-1 ring-border-token"
                      : "text-ink-muted hover:bg-surface/80 hover:text-ink",
                  )}
                  aria-current={item.isActive ? "page" : undefined}
                  aria-label={collapsed ? item.title : undefined}
                  title={item.title}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed ? (
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-muted">
                        {item.origin === "remote-only"
                          ? "On server"
                          : item.origin === "synced"
                            ? "Synced"
                            : "Local only"}
                      </span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border-token px-2 py-3">
        <Link
          to="/notebooks"
          className={cn(
            "flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
            collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
            resolvedActiveUtilityPath === "notebooks"
              ? "bg-surface text-ink shadow-sm ring-1 ring-border-token"
              : "text-ink-muted hover:bg-surface hover:text-ink",
          )}
          aria-label={collapsed ? "All notebooks" : undefined}
          aria-current={resolvedActiveUtilityPath === "notebooks" ? "page" : undefined}
          title={collapsed ? "All notebooks" : undefined}
        >
          <Rows3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed ? (
            <span className="text-sm font-medium">All notebooks</span>
          ) : null}
        </Link>
        <Link
          to="/help"
          className={cn(
            "mt-2 flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
            collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
            resolvedActiveUtilityPath === "help"
              ? "bg-surface text-ink shadow-sm ring-1 ring-border-token"
              : "text-ink-muted hover:bg-surface hover:text-ink",
          )}
          aria-label={collapsed ? "Help" : undefined}
          aria-current={resolvedActiveUtilityPath === "help" ? "page" : undefined}
          title={collapsed ? "Help" : undefined}
        >
          <CircleHelp className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed ? <span className="text-sm font-medium">Help</span> : null}
        </Link>

        {user ? (
          <div
            className={cn(
              "mt-2 rounded-xl border border-border-token bg-surface",
              collapsed ? "px-0 py-2.5" : "px-3 py-3",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                collapsed ? "justify-center" : "gap-3",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-editor text-xs font-semibold text-ink">
                {user.initials}
              </span>
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {user.label}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {user.email}
                  </span>
                </span>
              ) : null}
            </div>
            {onLogout ? (
              <Button
                type="button"
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={cn(
                  collapsed
                    ? "mx-auto mt-2 h-8 w-8 text-ink-muted hover:text-ink"
                    : "mt-3 w-full justify-start gap-2 text-ink-muted hover:text-ink",
                )}
                onClick={onLogout}
                disabled={logoutPending}
                aria-label="Log out"
                title="Log out"
              >
                {logoutPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut aria-hidden="true" />
                )}
                {!collapsed ? <span>Log out</span> : null}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
