import { useEffect } from "react";
import { useAppStore } from "@/app/model";
import { useAuthSessionQuery } from "./useAuthSessionQuery";

export function useAuthSessionSync() {
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const setAuthStatus = useAppStore((s) => s.setAuthStatus);
  const clearAuth = useAppStore((s) => s.logout);

  const { session, loading, error, isError } = useAuthSessionQuery();

  useEffect(() => {
    if (loading) {
      setAuthStatus("checking");
      return;
    }

    if (isError || error || !session) {
      clearAuth();
      setAuthStatus("idle");
      return;
    }

    setAuthUser(session.authenticated ? session.user : null);
    setAuthStatus("idle");
  }, [session, loading, error, isError, setAuthUser, setAuthStatus, clearAuth]);

  return { loading, error };
}
