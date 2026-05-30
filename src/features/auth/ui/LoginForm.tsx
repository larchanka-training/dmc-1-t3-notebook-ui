import { Button } from "@/shared/ui";
import { useLoginForm } from "../model/useLoginForm";

export function LoginForm() {
  const {
    step,
    otp,
    onOtpChange,
    onVerifyOtp,
    onChangeEmail,
    onResendCode,
    onEmailChange,
    onRequestOtp,
    email,
    onGoogleSignIn,
    error,
  } = useLoginForm();

  return (
    <div className="flex min-h-full items-center justify-center bg-app p-token-24">
      <section className="w-full max-w-sm rounded-lg border border-border-token bg-surface p-token-24 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

        {step === "request" ? (
          <>
            <form onSubmit={onRequestOtp} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-ink-muted">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={onEmailChange}
                  className="w-full rounded border border-border-strong px-3 py-2 text-sm text-ink focus:border-accent-primary focus:outline-none"
                />
              </label>
              <Button type="submit" variant="default" className="w-full py-2">
                Send code
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-ink-muted">
              <span className="h-px flex-1 bg-border-token" />
              or
              <span className="h-px flex-1 bg-border-token" />
            </div>

            <Button variant="outline" onClick={onGoogleSignIn} className="w-full py-2">
              Continue with Google
            </Button>
          </>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-3">
            <p className="text-sm text-ink-muted">
              Code sent to <span className="font-medium text-ink">{email}</span>.{" "}
              <button
                type="button"
                onClick={onChangeEmail}
                className="text-accent-primary hover:underline"
              >
                Change email
              </button>
            </p>
            <label className="block">
              <span className="mb-1 block text-sm text-ink-muted">One-time code</span>
              <input
                type="text"
                name="otp"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={onOtpChange}
                className="w-full rounded border border-border-strong px-3 py-2 text-sm text-ink focus:border-accent-primary focus:outline-none"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-accent-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="default" className="w-full py-2">
              Verify code
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onResendCode}
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
