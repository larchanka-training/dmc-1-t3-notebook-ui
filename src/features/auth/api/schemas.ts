import { z } from "zod";
import { userSummarySchema } from "@/entities/user";

export const requestOtpResponseSchema = z.object({
  challenge_id: z.string(),
  expires_in_seconds: z.number(),
  dev_otp: z.string().nullable().optional(),
});

export const verifyOtpResponseSchema = z.object({
  user: userSummarySchema,
  authenticated_at: z.string(),
});

export const sessionResponseSchema = z.discriminatedUnion("authenticated", [
  z.object({
    authenticated: z.literal(true),
    user: userSummarySchema,
  }),
  z.object({
    authenticated: z.literal(false),
    user: z.null().optional(),
  }),
]);

export const logoutResponseSchema = z.object({
  logged_out: z.boolean(),
});

export type RequestOtpResponse = z.infer<typeof requestOtpResponseSchema>;
export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
