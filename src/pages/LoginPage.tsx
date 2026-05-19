import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { Button } from "../components/Button";

// Temporary mock until real auth wiring (see docs/discuss.md Q1).
const MOCK_OTP = "1234";

export function LoginPage() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/notebooks" replace />;
  }

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

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-muted p-6">
      <section className="w-full max-w-sm rounded-lg border border-ink/10 bg-surface p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

        {step === "request" ? (
          <>
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-ink-muted">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-ink/15 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </label>
              <Button type="submit" variant="primary" className="w-full py-2">
                Send code
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-ink-muted">
              <span className="h-px flex-1 bg-ink/10" />
              or
              <span className="h-px flex-1 bg-ink/10" />
            </div>

            <Button
              variant="secondary"
              onClick={handleGoogleSignIn}
              className="w-full py-2"
            >
              Continue with Google
            </Button>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <p className="text-sm text-ink-muted">
              Code sent to{" "}
              <span className="font-medium text-ink">{email}</span>.{" "}
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-accent hover:underline"
              >
                Change email
              </button>
            </p>
            <label className="block">
              <span className="mb-1 block text-sm text-ink-muted">
                One-time code
              </span>
              <input
                type="text"
                name="otp"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded border border-ink/15 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" className="w-full py-2">
              Verify code
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendCode}
              className="w-full py-2"
            >
              Resend code
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
