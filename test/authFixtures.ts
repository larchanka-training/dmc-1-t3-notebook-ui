import type { UserSummary } from "@/entities/user";

export function testUser(
  email = "user@example.com",
  overrides: Partial<UserSummary> = {},
): UserSummary {
  return {
    id: "usr_test",
    email,
    display_name: null,
    ...overrides,
  };
}
