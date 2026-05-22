import { http, HttpResponse } from "msw";

const API = "/api/v1/auth";

let lastChallengeId = "otp_ch_test";
let lastDevOtp = "123456";
let lastEmail = "user@example.com";

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
    return HttpResponse.json({
      user: {
        id: "usr_test",
        email: lastEmail,
        display_name: null,
      },
      authenticated_at: "2026-05-14T10:00:00.000Z",
    });
  }),

  http.get(`${API}/session`, () =>
    HttpResponse.json({ authenticated: false as const }),
  ),

  http.post(`${API}/logout`, () => HttpResponse.json({ logged_out: true })),
];
