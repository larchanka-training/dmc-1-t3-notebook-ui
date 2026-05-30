import type { UserSummary } from "@/entities/user";

export interface AuthSlice {
  auth: {
    isAuthenticated: boolean;
    user: UserSummary | null;
    authenticatedAt: string | null;
    status: "idle" | "checking" | "requestingOtp" | "verifyingOtp" | "error";
    error: string | null;
  };
  setAuthUser: (user: UserSummary | null, authenticatedAt?: string | null) => void;
  setAuthStatus: (status: AuthSlice["auth"]["status"], error?: string | null) => void;
  logout: () => void;
}
