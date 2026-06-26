import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/shared/api";
import { backendAiGenerationProvider } from "./backendAiProvider";
import { generateCodeBlock } from "./aiApi";

vi.mock("./aiApi", () => ({
  generateCodeBlock: vi.fn(),
}));

const generateCodeBlockMock = vi.mocked(generateCodeBlock);

const request = {
  notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
  sourceBlockId: "blk_intro",
  mode: "generate" as const,
  prompt: "Write JavaScript code.",
  context: {
    language: "javascript" as const,
    scope: "this" as const,
    sourceText: "Write JavaScript code.",
  },
  insertionStrategy: "next-empty-or-new-after-source" as const,
};

describe("backendAiGenerationProvider", () => {
  beforeEach(() => {
    generateCodeBlockMock.mockReset();
  });

  it("normalizes backend success into provider metadata", async () => {
    generateCodeBlockMock.mockResolvedValue({
      requestId: "air_success_1",
      status: "success",
      code: "const total = 1;",
      provider: {
        name: "bedrock",
        model: "deepseek.v3.2",
      },
      validation: {
        extractionApplied: true,
        syntaxOk: true,
        repairAttempts: 0,
      },
      warnings: [
        {
          code: "AI_CONTEXT_TRUNCATED",
          message: "Some context was omitted.",
        },
      ],
    });

    await expect(backendAiGenerationProvider.generate(request)).resolves.toEqual({
      requestId: "air_success_1",
      code: "const total = 1;",
      provider: {
        id: "bedrock",
        model: "deepseek.v3.2",
        label: "bedrock:deepseek.v3.2",
        path: "backend",
      },
      warnings: [
        {
          code: "AI_CONTEXT_TRUNCATED",
          message: "Some context was omitted.",
        },
      ],
    });
  });

  it("maps backend ApiError into a normalized generation error", async () => {
    generateCodeBlockMock.mockRejectedValue(
      new ApiError(504, "AI_PROVIDER_TIMEOUT", "The AI provider timed out.", {
        retryable: true,
        requestId: "air_timeout_1",
      }),
    );

    await expect(backendAiGenerationProvider.generate(request)).rejects.toMatchObject({
      name: "AiGenerationError",
      code: "AI_PROVIDER_TIMEOUT",
      message: "The AI provider timed out.",
      retryable: true,
      requestId: "air_timeout_1",
      kind: "provider",
    });
  });
});
