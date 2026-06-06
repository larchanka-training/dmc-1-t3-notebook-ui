import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/app/model";

export function useLoginPage() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);
  const status = useAppStore((s) => s.auth.status);

  const redirect: ReactNode | null =
    status !== "checking" && isAuthenticated ? (
      <Navigate to="/notebooks" replace />
    ) : null;

  return { redirect, isCheckingSession: status === "checking" };
}
