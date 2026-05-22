import { httpClient } from "@/shared/api";
import { parseAuthResponse } from "./parseAuthResponse";
import {
  logoutResponseSchema,
  requestOtpResponseSchema,
  sessionResponseSchema,
  verifyOtpResponseSchema,
  type LogoutResponse,
  type RequestOtpResponse,
  type SessionResponse,
  type VerifyOtpResponse,
} from "./schemas";

const AUTH_PREFIX = "/auth";

export async function requestOtp(email: string): Promise<RequestOtpResponse> {
  const data = await httpClient.post<unknown>(`${AUTH_PREFIX}/request-otp`, {
    email,
  });
  return parseAuthResponse(requestOtpResponseSchema, data);
}

export async function verifyOtp(
  challengeId: string,
  otpCode: string,
): Promise<VerifyOtpResponse> {
  const data = await httpClient.post<unknown>(`${AUTH_PREFIX}/verify-otp`, {
    challenge_id: challengeId,
    otp_code: otpCode,
  });
  return parseAuthResponse(verifyOtpResponseSchema, data);
}

export async function getSession(): Promise<SessionResponse> {
  const data = await httpClient.get<unknown>(`${AUTH_PREFIX}/session`);
  return parseAuthResponse(sessionResponseSchema, data);
}

export async function logout(): Promise<LogoutResponse> {
  const data = await httpClient.post<unknown>(`${AUTH_PREFIX}/logout`);
  return parseAuthResponse(logoutResponseSchema, data);
}
