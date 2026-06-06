import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { UserSummary } from "@/entities/user";
import { getSession, type SessionResponse } from "../api";
import { authQueryKeys } from "../utils/authQueryKeys";
import { mapAuthError } from "../utils/mapAuthError";

export type UseAuthSessionQueryOptions = {
  enabled?: boolean;
};

export function useAuthSessionQuery(options: UseAuthSessionQueryOptions = {}) {
  const { enabled = true } = options;

  const { data, isPending, isFetching, error, refetch, isError } = useQuery({
    queryKey: authQueryKeys.session,
    queryFn: getSession,
    staleTime: 30_000,
    retry: false,
    enabled,
  });

  const session: SessionResponse | null = data ?? null;
  const user: UserSummary | null =
    session?.authenticated === true ? session.user : null;
  const isAuthenticated = Boolean(user?.email);

  const fetchSession = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    fetchSession,
    session,
    user,
    isAuthenticated,
    loading: isPending || isFetching,
    error: error ? mapAuthError(error) : null,
    isError,
  };
}
