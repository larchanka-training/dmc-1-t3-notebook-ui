import { z } from "zod";

export const userSummarySchema = z.object({
  id: z.string(),
  email: z.string().min(1),
  display_name: z.string().nullable().optional(),
});

export type UserSummaryDto = z.infer<typeof userSummarySchema>;
