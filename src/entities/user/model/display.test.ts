import { describe, expect, it } from "vitest";
import { getUserDisplayLabel } from "./display";

describe("getUserDisplayLabel", () => {
  it("prefers display_name when set", () => {
    expect(
      getUserDisplayLabel({
        id: "1",
        email: "a@b.com",
        display_name: "Alex",
      }),
    ).toBe("Alex");
  });

  it("falls back to email", () => {
    expect(
      getUserDisplayLabel({
        id: "1",
        email: "a@b.com",
        display_name: null,
      }),
    ).toBe("a@b.com");
  });
});
