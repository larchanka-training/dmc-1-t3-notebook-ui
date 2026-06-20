import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import { TEST_API_BASE } from "@test/msw/handlers/auth";
import { server } from "@test/msw/server";
import { getSession, requestOtp, verifyOtp } from "./authApi";

describe("authApi", () => {
  it("requestOtp returns challenge and dev_otp", async () => {
    const result = await requestOtp("user@example.com");
    expect(result.challenge_id).toMatch(/^otp_ch_/);
    expect(result.dev_otp).toBe("123456");
  });

  it("verifyOtp authenticates with dev_otp", async () => {
    const challenge = await requestOtp("verify@example.com");
    const result = await verifyOtp(challenge.challenge_id, challenge.dev_otp!);
    expect(result.user.email).toBe("verify@example.com");
  });

  it("getSession returns anonymous by default", async () => {
    const session = await getSession();
    expect(session.authenticated).toBe(false);
  });

  it("throws ApiError when response shape is invalid", async () => {
    server.use(
      http.get(`${TEST_API_BASE}/auth/session`, () =>
        HttpResponse.json({ authenticated: true, user: { id: "", email: "" } }),
      ),
    );

    await expect(getSession()).rejects.toEqual(
      expect.objectContaining<Partial<ApiError>>({
        name: "ApiError",
        code: "invalid_response",
      }),
    );
  });
});
