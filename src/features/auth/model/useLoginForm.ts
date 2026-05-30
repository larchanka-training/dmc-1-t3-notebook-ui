import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";
import { MOCK_OTP } from "./constants";

export function useLoginForm() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStep("verify");
  }

  function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    if (otp.trim() === MOCK_OTP) {
      setAuthenticated(true, email);
      navigate("/notebooks", { replace: true });
      return;
    }
    setError("Invalid code. Try again.");
  }

  function handleChangeEmail() {
    setStep("request");
    setOtp("");
    setError(null);
  }

  function handleResendCode() {
    // Mock: no real delivery yet; stay on the verify step.
  }

  function handleGoogleSignIn() {
    // intentional no-op stub (real OAuth is a later task)
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function onOtpChange(event: ChangeEvent<HTMLInputElement>) {
    setOtp(event.target.value);
  }

  return {
    step,
    email,
    otp,
    error,
    onRequestOtp: handleRequestOtp,
    onVerifyOtp: handleVerifyOtp,
    onChangeEmail: handleChangeEmail,
    onResendCode: handleResendCode,
    onGoogleSignIn: handleGoogleSignIn,
    onEmailChange,
    onOtpChange,
  };
}
