import { Button, Card, CardContent, CardHeader, Input } from "@/shared/ui";
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
    devOtpHint,
    otpExpiryHint,
    isSubmitting,
  } = useLoginForm();

  return (
    <div className="flex min-h-full items-center justify-center bg-app p-token-24">
      <Card className="w-full max-w-sm rounded-lg border-border-token bg-surface shadow-sm">
        <CardHeader className="p-token-24 pb-0">
          <h1 className="text-xl font-semibold text-ink">Sign in</h1>
        </CardHeader>
        <CardContent className="space-y-3 p-token-24 pt-4">
          {step === "request" ? (
            <>
              <form onSubmit={onRequestOtp} className="space-y-3">
                <label htmlFor="login-email" className="block">
                  <span className="mb-1 block text-sm text-ink-muted">Email</span>
                  <Input
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={onEmailChange}
                  />
                </label>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Send code"}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-ink-muted">
                <span className="h-px flex-1 bg-border-token" />
                or
                <span className="h-px flex-1 bg-border-token" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={onGoogleSignIn}
                className="w-full py-2"
                disabled={isSubmitting}
              >
                Continue with Google
              </Button>
            </>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-3">
              <p className="text-sm text-ink-muted">
                Code sent to <span className="font-medium text-ink">{email}</span>.
                {otpExpiryHint && (
                  <>
                    {" "}
                    <span className="block pt-1">{otpExpiryHint}</span>
                  </>
                )}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-accent-primary"
                  onClick={onChangeEmail}
                >
                  Change email
                </Button>
              </p>
              {devOtpHint && (
                <p className="rounded-md border border-border-token bg-surface-muted px-3 py-2 text-xs text-ink-muted">
                  Development code:{" "}
                  <span className="font-mono font-medium text-ink">{devOtpHint}</span>
                </p>
              )}
              <label htmlFor="login-otp" className="block">
                <span className="mb-1 block text-sm text-ink-muted">One-time code</span>
                <Input
                  id="login-otp"
                  type="text"
                  name="otp"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={onOtpChange}
                  disabled={isSubmitting}
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-accent-danger">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="default"
                className="w-full py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying…" : "Verify code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onResendCode}
                className="w-full py-2"
                disabled={isSubmitting}
              >
                Resend code
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
