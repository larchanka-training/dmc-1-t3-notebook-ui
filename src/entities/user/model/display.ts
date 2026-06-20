import type { UserSummary } from "./types";

/** Label for UI: display_name when set, otherwise email. */
export function getUserDisplayLabel(user: UserSummary): string {
  const name = user.display_name?.trim();
  return name || user.email;
}
