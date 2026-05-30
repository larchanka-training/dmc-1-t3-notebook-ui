import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../model";

export function RequireAuth() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const status = useAppStore((state) => state.auth.status);

  if (status === "checking") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center text-sm text-ink-muted"
        aria-busy="true"
        aria-live="polite"
      >
        Checking session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
