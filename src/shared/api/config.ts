/** API base URL without trailing slash. Prefer same-origin `/api/v1` in dev (Vite proxy). */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "/api/v1";
}

/** Absolute URL for browser navigation (e.g. Google OAuth start). */
export function getAuthGoogleStartUrl(): string {
  return `${getApiBaseUrl()}/auth/google/start`;
}
