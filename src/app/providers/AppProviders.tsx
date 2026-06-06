import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, type ReactNode } from "react";
import { AuthSessionSync } from "./AuthSessionSync";
import { AppErrorBoundary } from "../ui/AppErrorBoundary";
import { AppToastHost } from "../ui/AppToastHost";
import { queryClient } from "./queryClient";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthSessionSync />
        <AppErrorBoundary>
          {children}
          <AppToastHost />
        </AppErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  );
}
