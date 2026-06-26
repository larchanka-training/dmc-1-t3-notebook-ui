import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LocalAiRuntimeController,
  checkWebLlmRuntimeCapability,
  setLocalAiRuntimeControllerForTests,
  useLocalAiRuntime,
} from "./localRuntime";

const unloadMock = vi.fn();
const loadModuleMock = vi.fn();

describe("checkWebLlmRuntimeCapability", () => {
  it("returns unsupported when WebGPU is unavailable", async () => {
    const capability = await checkWebLlmRuntimeCapability({
      isSecureContext: true,
      Worker: class FakeWorker {} as unknown as typeof Worker,
      WebAssembly: globalThis.WebAssembly,
      navigator: {},
    });

    expect(capability).toEqual({
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime requires WebGPU support.",
        retryable: false,
      },
    });
  });
});

describe("useLocalAiRuntime", () => {
  beforeEach(() => {
    unloadMock.mockReset();
    loadModuleMock.mockReset();
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "dev-opt-in",
          modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        loadModule: (moduleSpecifier: string) => loadModuleMock(moduleSpecifier),
        checkCapability: async () => ({ supported: true as const }),
      }),
    );
  });

  it("stays idle on mount without triggering runtime bootstrap", () => {
    const { result } = renderHook(() => useLocalAiRuntime());

    expect(result.current.status).toBe("idle");
    expect(loadModuleMock).not.toHaveBeenCalled();
  });
});

describe("LocalAiRuntimeController", () => {
  it("bootstraps lazily and transitions to ready", async () => {
    let resolveEngine: ((engine: { unload: typeof unloadMock }) => void) | undefined;
    const controller = new LocalAiRuntimeController({
      getConfig: () => ({
        enabled: true,
        rolloutPolicy: "dev-opt-in",
        modelId: "test-model",
        bootstrapTimeoutMs: 500,
        moduleSpecifier: "@mlc-ai/web-llm",
      }),
      checkCapability: async () => ({ supported: true }),
      loadModule: async () => ({
        CreateMLCEngine: (_modelId, options) =>
          new Promise<{ unload: typeof unloadMock }>((resolve) => {
            options?.initProgressCallback?.({ text: "Downloading weights" });
            resolveEngine = resolve;
          }),
      }),
    });

    const initializePromise = controller.initialize();
    await waitFor(() => {
      expect(controller.getSnapshot().status).toBe("loading-model");
      expect(controller.getSnapshot().progressLabel).toBe("Downloading weights");
    });

    if (resolveEngine) {
      resolveEngine({ unload: unloadMock });
    }
    const snapshot = await initializePromise;

    expect(snapshot.status).toBe("ready");
    expect(snapshot.progressLabel).toBeNull();
  });

  it("exposes stable failed state on bootstrap errors", async () => {
    const controller = new LocalAiRuntimeController({
      getConfig: () => ({
        enabled: true,
        rolloutPolicy: "dev-opt-in",
        modelId: "test-model",
        bootstrapTimeoutMs: 50,
        moduleSpecifier: "@mlc-ai/web-llm",
      }),
      checkCapability: async () => ({ supported: true }),
      loadModule: async () => {
        throw new Error("Chunk load failed");
      },
    });

    const snapshot = await controller.initialize();

    expect(snapshot.status).toBe("failed");
    expect(snapshot.error).toEqual({
      code: "bootstrap_failed",
      message: "Chunk load failed",
      retryable: true,
    });
  });

  it("can reset back to idle after a failed initialization", async () => {
    const controller = new LocalAiRuntimeController({
      getConfig: () => ({
        enabled: true,
        rolloutPolicy: "dev-opt-in",
        modelId: "test-model",
        bootstrapTimeoutMs: 50,
        moduleSpecifier: "@mlc-ai/web-llm",
      }),
      checkCapability: async () => ({ supported: true }),
      loadModule: async () => {
        throw new Error("Chunk load failed");
      },
    });

    await controller.initialize();
    expect(controller.getSnapshot().status).toBe("failed");

    const snapshot = await controller.reset();

    expect(snapshot.status).toBe("idle");
    expect(snapshot.error).toBeNull();
  });

  it("maps capability failures to unsupported", async () => {
    const controller = new LocalAiRuntimeController({
      getConfig: () => ({
        enabled: true,
        rolloutPolicy: "dev-opt-in",
        modelId: "test-model",
        bootstrapTimeoutMs: 20,
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
    });

    const snapshot = await controller.initialize();

    expect(snapshot.status).toBe("unsupported");
    expect(snapshot.error).toEqual({
      code: "unsupported_environment",
      message: "No compatible adapter.",
      retryable: false,
    });
  });

  it("maps timeout to failed", async () => {
    const controller = new LocalAiRuntimeController({
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
    });

    const snapshot = await controller.initialize();

    expect(snapshot.status).toBe("failed");
    expect(snapshot.error).toEqual({
      code: "bootstrap_timeout",
      message: "Local AI runtime initialization timed out.",
      retryable: true,
    });
  });

  it("maps cancellation to failed", async () => {
    const controller = new LocalAiRuntimeController({
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
    });
    const abortController = new globalThis.AbortController();

    abortController.abort();
    const snapshot = await controller.initialize({ signal: abortController.signal });

    expect(snapshot.status).toBe("failed");
    expect(snapshot.error).toEqual({
      code: "bootstrap_cancelled",
      message: "Local AI runtime initialization was cancelled.",
      retryable: true,
    });
  });
});
