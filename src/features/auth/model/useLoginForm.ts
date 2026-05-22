import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { getAuthGoogleStartUrl } from "@/shared/api";
import { formatOtpExpiry } from "../utils/formatOtpExpiry";
import { useRequestOtpMutation } from "./useRequestOtpMutation";
import { useVerifyOtpMutation } from "./useVerifyOtpMutation";

export function useLoginForm() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [otpExpiryHint, setOtpExpiryHint] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    requestOtp,
    loading: requestLoading,
    error: requestError,
    reset: resetRequestOtp,
  } = useRequestOtpMutation({
    onSuccess: (data) => {
      setChallengeId(data.challenge_id);
      setDevOtpHint(data.dev_otp ?? null);
      setOtpExpiryHint(formatOtpExpiry(data.expires_in_seconds));
      setStep("verify");
      setOtp("");
      setLocalError(null);
    },
  });

  const {
    verifyOtp,
    loading: verifyLoading,
    error: verifyError,
    reset: resetVerifyOtp,
  } = useVerifyOtpMutation();

  const onRequestOtp = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      setLocalError(null);
      requestOtp(email);
    },
    [email, requestOtp],
  );

  const onVerifyOtp = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      if (!challengeId) {
        setLocalError("Request a new code first.");
        return;
      }

      setLocalError(null);
      verifyOtp({ challengeId, otpCode: otp });
    },
    [challengeId, otp, verifyOtp],
  );

  const onChangeEmail = useCallback(() => {
    setStep("request");
    setOtp("");
    setChallengeId(null);
    setDevOtpHint(null);
    setOtpExpiryHint(null);
    setLocalError(null);
    resetRequestOtp();
    resetVerifyOtp();
  }, [resetRequestOtp, resetVerifyOtp]);

  const onResendCode = useCallback(() => {
    setLocalError(null);
    requestOtp(email);
  }, [email, requestOtp]);

  const onGoogleSignIn = useCallback(() => {
    globalThis.location.assign(getAuthGoogleStartUrl());
  }, []);

  const onEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const onOtpChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value);
  }, []);

  return {
    step,
    email,
    otp,
    error: localError ?? requestError ?? verifyError,
    devOtpHint,
    otpExpiryHint,
    isSubmitting: requestLoading || verifyLoading,
    onRequestOtp,
    onVerifyOtp,
    onChangeEmail,
    onResendCode,
    onGoogleSignIn,
    onEmailChange,
    onOtpChange,
  };
}
