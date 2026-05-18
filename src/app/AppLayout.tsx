import { Outlet } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";

export function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-surface-muted">
        <Outlet />
      </main>
    </div>
  );
}
