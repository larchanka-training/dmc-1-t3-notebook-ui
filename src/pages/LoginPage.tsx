import type { FormEvent } from "react";
import { Button } from "../components/Button";

export function LoginPage() {
  function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
  }

  function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
  }

  function handleGoogleSignIn() {
    // intentional no-op stub
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-muted p-6">
      <section className="w-full max-w-sm rounded-lg border border-ink/10 bg-surface p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

        <form onSubmit={handleRequestOtp} className="space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="w-full rounded border border-ink/15 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <Button type="submit" variant="primary" className="w-full py-2">
            Send code
          </Button>
        </form>

        <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">
              One-time code
            </span>
            <input
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full rounded border border-ink/15 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <Button type="submit" variant="primary" className="w-full py-2">
            Verify code
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
          Sign in with Google
        </Button>
      </section>
    </div>
  );
}
