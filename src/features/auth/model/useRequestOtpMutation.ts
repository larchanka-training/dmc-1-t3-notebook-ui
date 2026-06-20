import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAppStore } from "@/app/model";
import { requestOtp, type RequestOtpResponse } from "../api";
import { mapAuthError } from "../utils/mapAuthError";

export type RequestOtpVariables = {
  email: string;
};

export type UseRequestOtpMutationOptions = {
  onSuccess?: (data: RequestOtpResponse, variables: RequestOtpVariables) => void;
};

export function useRequestOtpMutation(options: UseRequestOtpMutationOptions = {}) {
  const setAuthStatus = useAppStore((s) => s.setAuthStatus);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ email }: RequestOtpVariables) => requestOtp(email),
    onMutate: () => setAuthStatus("requestingOtp"),
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (err) => setAuthStatus("error", mapAuthError(err)),
    onSettled: () => setAuthStatus("idle"),
  });

  const requestOtpAction = useCallback(
    (email: string) => {
      mutate({ email: email.trim() });
    },
    [mutate],
  );

  return {
    requestOtp: requestOtpAction,
    loading: isPending,
    error: error ? mapAuthError(error) : null,
    reset,
  };
}
