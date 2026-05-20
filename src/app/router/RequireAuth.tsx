import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../model";

export function RequireAuth() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
