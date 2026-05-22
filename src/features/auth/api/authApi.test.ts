import { describe, expect, it } from "vitest";
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
});
