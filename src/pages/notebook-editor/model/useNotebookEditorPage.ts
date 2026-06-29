import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLogout } from "@/features/auth";

export function useNotebookEditorPage() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout, loading: logoutPending } = useLogout();

  return {
    notebookId: notebookId ?? null,
    isSidebarCollapsed,
    toggleSidebar: () => setIsSidebarCollapsed((current) => !current),
    logout,
    logoutPending,
  };
}
