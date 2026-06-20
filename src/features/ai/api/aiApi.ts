import { z } from "zod";
import { ApiError, httpClient } from "@/shared/api";

const AI_PREFIX = "/ai";

const aiWarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

const aiSuccessResponseSchema = z.object({
  requestId: z.string().min(1),
  status: z.literal("success"),
  code: z.string(),
  provider: z.object({
    name: z.string().min(1),
    model: z.string().min(1),
  }),
  validation: z.object({
    extractionApplied: z.boolean(),
    syntaxOk: z.literal(true),
    repairAttempts: z.number().int().min(0).max(1),
  }),
  warnings: z.array(aiWarningSchema).optional().default([]),
});

const relevantBlockSchema = z.object({
  blockId: z.string().min(1),
  type: z.enum(["text", "code"]),
  content: z.string(),
});

const aiGenerateRequestSchema = z.object({
  notebookId: z.string().min(1),
  sourceBlockId: z.string().min(1),
  mode: z.enum(["generate", "revise"]),
  prompt: z.string().min(1),
  context: z.object({
    language: z.literal("javascript"),
    scope: z.enum(["this", "notebook"]).optional(),
    sourceText: z.string().min(1),
    notebookTitle: z.string().max(200).optional(),
    globalsSummary: z.array(z.string()).max(50).optional(),
    relevantBlocks: z.array(relevantBlockSchema).max(20).optional(),
  }),
  insertionStrategy: z.literal("next-empty-or-new-after-source"),
});

export type AiGenerateRequest = z.infer<typeof aiGenerateRequestSchema>;
export type AiGenerateSuccess = z.infer<typeof aiSuccessResponseSchema>;
export type AiWarning = z.infer<typeof aiWarningSchema>;

export async function generateCodeBlock(
  request: AiGenerateRequest,
): Promise<AiGenerateSuccess> {
  const payload = aiGenerateRequestSchema.parse(request);
  const data = await httpClient.post<unknown>(
    `${AI_PREFIX}/code-blocks/generate`,
    payload,
  );
  const parsed = aiSuccessResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new ApiError(
      502,
      "invalid_response",
      "Unexpected AI response from the backend.",
    );
  }

  return parsed.data;
}
