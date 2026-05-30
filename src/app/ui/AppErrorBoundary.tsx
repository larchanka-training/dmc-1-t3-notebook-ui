import { Component, type ErrorInfo, type ReactNode } from "react";
import { useAppStore } from "@/app/model";
import { Button } from "@/shared/ui";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error boundary caught:", error, info.componentStack);
    useAppStore
      .getState()
      .showToast("Something went wrong. Please reload the page.", "error");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-full flex-col items-center justify-center gap-4 bg-app p-8 text-ink"
          role="alert"
        >
          <h1 className="text-lg font-semibold">Unexpected error</h1>
          <p className="max-w-md text-center text-sm text-ink-muted">
            The application hit an error. Reload the page to continue.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => globalThis.location.reload()}
          >
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
