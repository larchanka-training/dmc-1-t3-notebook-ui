import type { UserSummary } from "../model/types";

export function userSummaryFromPersisted(
  stored: { user?: UserSummary | null; userEmail?: string | null } | undefined,
): UserSummary | null {
  if (stored?.user) return stored.user;
  if (stored?.userEmail) {
    return { id: "", email: stored.userEmail, display_name: null };
  }
  return null;
}
