import { BookOpen, FileText } from "lucide-react";
import { useAppStore } from "@/app/model";
import { DEFAULT_NOTEBOOK_TITLE } from "@/entities/notebook";
import { getUserDisplayLabel } from "@/entities/user";
import { useNotebooksList } from "./useNotebooksList";

type UseNotebookSidebarOptions = {
  activeNotebookId: string | null;
  activeUtilityPath?: "notebooks" | "help" | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function itemKey(id: string | null, serverId: string | null): string {
  return id ?? `server-${serverId ?? "unknown"}`;
}

function getInitials(label: string): string {
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function useNotebookSidebar({
  activeNotebookId,
  activeUtilityPath = null,
  collapsed,
  onToggleCollapsed,
}: UseNotebookSidebarOptions) {
  const { items, status, error, onCreateNotebook, onOpen } = useNotebooksList();
  const user = useAppStore((state) => state.auth.user);
  const hasActiveItem =
    activeNotebookId !== null && items.some((item) => item.id === activeNotebookId);
  const resolvedItems =
    !hasActiveItem && activeNotebookId
      ? [
          {
            id: activeNotebookId,
            serverId: null,
            title: DEFAULT_NOTEBOOK_TITLE,
            updatedAt: new Date(0).toISOString(),
            origin: "local-only" as const,
          },
          ...items,
        ]
      : items;
  const userLabel = user ? getUserDisplayLabel(user) : "Notebook user";

  return {
    collapsed,
    notebookCount: resolvedItems.length,
    activeUtilityPath,
    items: resolvedItems.map((item) => ({
      ...item,
      key: itemKey(item.id, item.serverId),
      isActive: item.id === activeNotebookId,
      icon: item.id === activeNotebookId ? BookOpen : FileText,
    })),
    user: user
      ? {
          label: userLabel,
          email: user.email,
          initials: getInitials(userLabel),
        }
      : null,
    status,
    error,
    onCreateNotebook,
    onOpen,
    onToggleCollapsed,
  };
}
