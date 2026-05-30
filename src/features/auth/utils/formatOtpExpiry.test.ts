import { describe, expect, it } from "vitest";
import { formatOtpExpiry } from "./formatOtpExpiry";

describe("formatOtpExpiry", () => {
  it("formats sub-minute expiry in seconds", () => {
    expect(formatOtpExpiry(45)).toBe("Code expires in 45 seconds.");
  });

  it("formats minute-based expiry from expires_in_seconds", () => {
    expect(formatOtpExpiry(300)).toBe("Code expires in 5 minutes.");
  });
});
