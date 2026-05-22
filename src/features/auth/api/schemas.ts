import type { UserSummary } from "@/entities/user";

export type RequestOtpResponse = {
  challenge_id: string;
  expires_in_seconds: number;
  dev_otp?: string | null;
};

export type VerifyOtpResponse = {
  user: UserSummary;
  authenticated_at: string;
};

export type SessionResponse =
  | {
      authenticated: true;
      user: UserSummary;
    }
  | {
      authenticated: false;
      user?: null;
    };

export type LogoutResponse = {
  logged_out: boolean;
};
