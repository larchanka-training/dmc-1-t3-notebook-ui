import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-app">
        <Outlet />
      </main>
    </div>
  );
}
