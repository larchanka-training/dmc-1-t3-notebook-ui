import type { UserSummary } from "@/entities/user";
import type { VerifyOtpResponse } from "../api/schemas";

export function authFromVerifyResponse(response: VerifyOtpResponse): {
  user: UserSummary;
  authenticatedAt: string;
} {
  return {
    user: response.user,
    authenticatedAt: response.authenticated_at,
  };
}
