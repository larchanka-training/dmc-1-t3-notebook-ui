import { http, HttpResponse } from "msw";

export const TEST_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";
const API = `${TEST_API_BASE}/auth`;

let lastChallengeId = "otp_ch_test";
let lastDevOtp = "123456";
let lastEmail = "user@example.com";
let sessionAuthenticated = false;

export function setMockSessionAuthenticated(authenticated: boolean, email = lastEmail) {
  sessionAuthenticated = authenticated;
  if (email) {
    lastEmail = email;
  }
}

export function resetAuthMockState() {
  lastChallengeId = "otp_ch_test";
  lastDevOtp = "123456";
  lastEmail = "user@example.com";
  sessionAuthenticated = false;
}

export const authHandlers = [
  http.post(`${API}/request-otp`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (!body.email?.includes("@")) {
      return HttpResponse.json(
        { error: { code: "validation_error", message: "Invalid email" } },
        { status: 422 },
      );
    }
    lastEmail = body.email ?? lastEmail;
    lastChallengeId = `otp_ch_${body.email}`;
    return HttpResponse.json({
      challenge_id: lastChallengeId,
      expires_in_seconds: 300,
      dev_otp: lastDevOtp,
    });
  }),

  http.post(`${API}/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as {
      challenge_id?: string;
      otp_code?: string;
    };
    if (body.otp_code !== lastDevOtp) {
      return HttpResponse.json(
        {
          error: { code: "otp_invalid", message: "The provided OTP code is invalid." },
        },
        { status: 401 },
      );
    }
    sessionAuthenticated = true;
    return HttpResponse.json({
      user: {
        id: "usr_test",
        email: lastEmail,
        display_name: null,
      },
      authenticated_at: "2026-05-14T10:00:00.000Z",
    });
  }),

  http.get(`${API}/session`, () => {
    if (!sessionAuthenticated) {
      return HttpResponse.json({ authenticated: false as const });
    }
    return HttpResponse.json({
      authenticated: true as const,
      user: {
        id: "usr_test",
        email: lastEmail,
        display_name: null,
      },
    });
  }),

  http.post(`${API}/logout`, () => {
    sessionAuthenticated = false;
    return HttpResponse.json({ logged_out: true });
  }),
];
