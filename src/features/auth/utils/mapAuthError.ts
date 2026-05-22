import { ApiError } from "@/shared/api";

const OTP_ERROR_MESSAGES: Record<string, string> = {
  otp_invalid: "Invalid code. Try again.",
  otp_expired: "This code has expired. Request a new one.",
  otp_challenge_not_found: "This code has expired. Request a new one.",
  otp_challenge_expired: "This code has expired. Request a new one.",
  otp_attempt_limit_exceeded: "Too many attempts. Request a new code.",
  otp_request_rate_limited: "Too many requests. Try again later.",
  google_oauth_not_configured: "Google sign-in is not available.",
};

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    return OTP_ERROR_MESSAGES[error.code] ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
