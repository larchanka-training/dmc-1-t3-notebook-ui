import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";
import { logout as logoutApi } from "../api";
import { authQueryKeys } from "../utils/authQueryKeys";
import { mapAuthError } from "../utils/mapAuthError";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeLogout = useAppStore((s) => s.logout);

  const { mutate, isPending, error } = useMutation({
    mutationFn: logoutApi,
    onSettled: async () => {
      storeLogout();
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      navigate("/login", { replace: true });
    },
  });

  const logout = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    logout,
    loading: isPending,
    error: error ? mapAuthError(error) : null,
  };
}
