import { httpClient } from "@/shared/api";
import type {
  LogoutResponse,
  RequestOtpResponse,
  SessionResponse,
  VerifyOtpResponse,
} from "./schemas";

const AUTH_PREFIX = "/auth";

export async function requestOtp(email: string): Promise<RequestOtpResponse> {
  return httpClient.post<RequestOtpResponse>(`${AUTH_PREFIX}/request-otp`, {
    email,
  });
}

export async function verifyOtp(
  challengeId: string,
  otpCode: string,
): Promise<VerifyOtpResponse> {
  return httpClient.post<VerifyOtpResponse>(`${AUTH_PREFIX}/verify-otp`, {
    challenge_id: challengeId,
    otp_code: otpCode,
  });
}

export async function getSession(): Promise<SessionResponse> {
  return httpClient.get<SessionResponse>(`${AUTH_PREFIX}/session`);
}

export async function logout(): Promise<LogoutResponse> {
  return httpClient.post<LogoutResponse>(`${AUTH_PREFIX}/logout`);
}
