import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store";

export function RequireAuth() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
