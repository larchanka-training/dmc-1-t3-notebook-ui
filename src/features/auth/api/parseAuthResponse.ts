import type { z } from "zod";
import { ApiError } from "@/shared/api";

export function parseAuthResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      502,
      "invalid_response",
      "Unexpected authentication response from server.",
    );
  }
  return result.data;
}
