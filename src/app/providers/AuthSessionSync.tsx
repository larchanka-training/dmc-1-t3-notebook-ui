import { useAuthSessionSync } from "@/features/auth";

/**
 * Hydrates Zustand auth state from GET /auth/session on app start.
 */
export function AuthSessionSync() {
  useAuthSessionSync();
  return null;
}
