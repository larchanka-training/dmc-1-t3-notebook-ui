import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import { server } from "../../../../test/msw/server";
import { generateCodeBlock } from "./aiApi";

const TEST_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";
const AI_GENERATE_URL = `${TEST_API_BASE}/ai/code-blocks/generate`;

const request = {
  notebookId: "nb_jsnb_50",
  sourceBlockId: "blk_intro",
  mode: "generate" as const,
  prompt: "Write JavaScript code that sums an array of numbers.",
  context: {
    language: "javascript" as const,
    scope: "this" as const,
    sourceText: "Write JavaScript code that sums an array of numbers.",
  },
  insertionStrategy: "next-empty-or-new-after-source" as const,
};

describe("generateCodeBlock", () => {
  it("returns parsed success payload", async () => {
    server.use(
      http.post(AI_GENERATE_URL, () =>
        HttpResponse.json({
          requestId: "air_success_1",
          status: "success",
          code: "function sum(values) { return values.reduce((acc, value) => acc + value, 0); }",
          provider: {
            name: "bedrock",
            model: "deepseek.v3.2",
          },
          validation: {
            extractionApplied: true,
            syntaxOk: true,
            repairAttempts: 0,
          },
        }),
      ),
    );

    await expect(generateCodeBlock(request)).resolves.toEqual(
      expect.objectContaining({
        requestId: "air_success_1",
        status: "success",
      }),
    );
  });

  it("maps normalized backend errors into ApiError without string matching", async () => {
    server.use(
      http.post(AI_GENERATE_URL, () =>
        HttpResponse.json(
          {
            requestId: "air_timeout_1",
            status: "error",
            errorCode: "AI_PROVIDER_TIMEOUT",
            message: "The AI provider did not respond in time. Try again.",
            retryable: true,
          },
          { status: 504 },
        ),
      ),
    );

    await expect(generateCodeBlock(request)).rejects.toEqual(
      expect.objectContaining<Partial<ApiError>>({
        name: "ApiError",
        status: 504,
        code: "AI_PROVIDER_TIMEOUT",
        retryable: true,
        requestId: "air_timeout_1",
      }),
    );
  });
});
