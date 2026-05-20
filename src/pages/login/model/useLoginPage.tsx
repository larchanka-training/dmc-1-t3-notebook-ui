import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/app/model";

export function useLoginPage() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);

  const redirect: ReactNode | null = isAuthenticated ? (
    <Navigate to="/notebooks" replace />
  ) : null;

  return { redirect };
}
