import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";
import { verifyOtp } from "../api";
import { authFromVerifyResponse } from "../utils/applySessionResponse";
import { authQueryKeys } from "../utils/authQueryKeys";
import { mapAuthError } from "../utils/mapAuthError";

export type VerifyOtpVariables = {
  challengeId: string;
  otpCode: string;
};

export function useVerifyOtpMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const setAuthStatus = useAppStore((s) => s.setAuthStatus);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ challengeId, otpCode }: VerifyOtpVariables) =>
      verifyOtp(challengeId, otpCode),
    onMutate: () => setAuthStatus("verifyingOtp"),
    onSuccess: (data) => {
      const user = data?.user;

      if (!user?.email) {
        return;
      }

      const { user: authUser, authenticatedAt } = authFromVerifyResponse(data);
      setAuthUser(authUser, authenticatedAt);
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      navigate("/notebooks", { replace: true });
    },
    onError: (err) => setAuthStatus("error", mapAuthError(err)),
    onSettled: (_data, mutationError) => {
      if (!mutationError) {
        setAuthStatus("idle");
      }
    },
  });

  const verifyOtpAction = useCallback(
    (variables: VerifyOtpVariables) => {
      mutate({
        challengeId: variables.challengeId,
        otpCode: variables.otpCode.trim(),
      });
    },
    [mutate],
  );

  return {
    verifyOtp: verifyOtpAction,
    loading: isPending,
    error: error ? mapAuthError(error) : null,
    reset,
  };
}
