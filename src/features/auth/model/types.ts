export interface AuthSlice {
  auth: {
    isAuthenticated: boolean;
    userEmail: string | null;
    status: "idle" | "requestingOtp" | "verifyingOtp" | "error";
    error: string | null;
  };
  setAuthenticated: (authed: boolean, email?: string) => void;
  setAuthStatus: (status: AuthSlice["auth"]["status"], error?: string | null) => void;
  logout: () => void;
}
