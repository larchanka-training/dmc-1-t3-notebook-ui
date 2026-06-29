import { useState } from "react";
import { useLogout } from "@/features/auth";
import { helpSections } from "./helpContent";

export function useHelpPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout, loading: logoutPending } = useLogout();

  return {
    sections: helpSections,
    isSidebarCollapsed,
    toggleSidebar: () => setIsSidebarCollapsed((current) => !current),
    logout,
    logoutPending,
  };
}
