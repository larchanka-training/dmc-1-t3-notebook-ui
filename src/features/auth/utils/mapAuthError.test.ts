import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import { mapAuthError } from "./mapAuthError";

describe("mapAuthError", () => {
  it("maps known OTP error codes", () => {
    expect(
      mapAuthError(
        new ApiError(401, "otp_invalid", "The provided OTP code is invalid."),
      ),
    ).toBe("Invalid code. Try again.");
  });

  it("falls back to API message for unknown codes", () => {
    expect(
      mapAuthError(
        new ApiError(
          503,
          "google_oauth_not_configured",
          "Google OAuth is not configured.",
        ),
      ),
    ).toBe("Google sign-in is not available.");
  });
});
