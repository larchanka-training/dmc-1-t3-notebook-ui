import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalAiRuntimeController,
  setLocalAiRuntimeControllerForTests,
} from "../model/localRuntime";
import { localAiGenerationProvider } from "./localAiProvider";

const request = {
  notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
  sourceBlockId: "blk_intro",
  mode: "generate" as const,
  prompt: "Write JavaScript code that calculates a total.",
  context: {
    language: "javascript" as const,
    scope: "this" as const,
    sourceText: "Write JavaScript code that calculates a total.",
    notebookTitle: "Local AI notebook",
    relevantBlocks: [
      {
        blockId: "blk_intro",
        type: "text" as const,
        content: "Write JavaScript code that calculates a total.",
      },
    ],
  },
  insertionStrategy: "next-empty-or-new-after-source" as const,
};

describe("localAiGenerationProvider", () => {
  beforeEach(() => {
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 100,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: async () => ({
            chat: {
              completions: {
                create: async () => ({
                  choices: [
                    {
                      message: {
                        content: "```javascript\nconst total = items.reduce((sum, item) => sum + item, 0);\n```",
                      },
                    },
                  ],
                }),
              },
            },
          }),
        }),
      }),
    );
  });

  it("normalizes local WebLLM output into plain code with webllm provider metadata", async () => {
    await expect(localAiGenerationProvider.generate(request)).resolves.toMatchObject({
      code: "const total = items.reduce((sum, item) => sum + item, 0);",
      provider: {
        id: "webllm",
        model: "test-model",
        label: "webllm:test-model",
        path: "local",
      },
      warnings: [],
    });
  });

  it("maps unsupported runtime to a stable local provider error", async () => {
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 100,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({
          supported: false,
          error: {
            code: "unsupported_environment",
            message: "No compatible adapter.",
            retryable: false,
          },
        }),
      }),
    );

    await expect(localAiGenerationProvider.generate(request)).rejects.toMatchObject({
      name: "AiGenerationError",
      code: "AI_LOCAL_UNSUPPORTED",
      message: "No compatible adapter.",
      retryable: false,
      kind: "provider",
    });
  });

  it("maps bootstrap timeout to a local timeout error", async () => {
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 10,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: () =>
            new Promise(() => {
              return undefined;
            }),
        }),
      }),
    );

    await expect(localAiGenerationProvider.generate(request)).rejects.toMatchObject({
      name: "AiGenerationError",
      code: "AI_LOCAL_TIMEOUT",
      message: "Local AI runtime initialization timed out.",
      retryable: true,
      kind: "provider",
    });
  });

  it("maps cancellation to a local cancelled error", async () => {
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 100,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: () =>
            new Promise(() => {
              return undefined;
            }),
        }),
      }),
    );
    const abortController = new globalThis.AbortController();

    abortController.abort();

    await expect(
      localAiGenerationProvider.generate(request, {
        signal: abortController.signal,
      }),
    ).rejects.toMatchObject({
      name: "AiGenerationError",
      code: "AI_LOCAL_CANCELLED",
      message: "Local AI runtime initialization was cancelled.",
      retryable: true,
      kind: "provider",
    });
  });

  it("rejects unusable provider responses", async () => {
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 100,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: async () => ({
            chat: {
              completions: {
                create: async () => ({
                  choices: [
                    {
                      message: {
                        content: "Here is a short explanation without code.",
                      },
                    },
                  ],
                }),
              },
            },
          }),
        }),
      }),
    );

    await expect(localAiGenerationProvider.generate(request)).rejects.toMatchObject({
      name: "AiGenerationError",
      code: "AI_LOCAL_RESPONSE_INVALID",
      retryable: true,
      kind: "response",
    });
  });
});
