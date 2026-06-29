import { useCallback, useSyncExternalStore } from "react";
import { getLocalAiRuntimeConfig, type LocalAiRuntimeConfig } from "@/shared/config";
import type { AiGenerationProviderMetadata } from "../api";

export type LocalAiRuntimeStatus =
  | "unsupported"
  | "idle"
  | "loading-model"
  | "ready"
  | "failed";

export type LocalAiRuntimeErrorCode =
  | "feature_disabled"
  | "unsupported_environment"
  | "bootstrap_failed"
  | "bootstrap_timeout"
  | "bootstrap_cancelled"
  | "invalid_configuration";

export type LocalAiRuntimeError = {
  code: LocalAiRuntimeErrorCode;
  message: string;
  retryable: boolean;
};

export type LocalAiRuntimeSnapshot = {
  status: LocalAiRuntimeStatus;
  provider: AiGenerationProviderMetadata;
  progressLabel: string | null;
  error: LocalAiRuntimeError | null;
};

type InitProgress = {
  progress?: number;
  text?: string;
  timeElapsed?: number;
};

export type WebLlmEngine = {
  unload?: () => Promise<void> | void;
  [key: string]: unknown;
};

type WebLlmModule = {
  CreateMLCEngine: (
    modelId: string,
    options?: {
      initProgressCallback?: (progress: InitProgress) => void;
    },
  ) => Promise<WebLlmEngine>;
};

type RuntimeCapability =
  | { supported: true }
  | { supported: false; error: LocalAiRuntimeError };

type BrowserLike = {
  isSecureContext?: boolean;
  Worker?: typeof Worker;
  WebAssembly?: typeof globalThis.WebAssembly;
  navigator?: {
    gpu?: {
      requestAdapter?: () => Promise<unknown>;
    };
  };
};

type RuntimeDependencies = {
  getConfig?: () => LocalAiRuntimeConfig;
  loadModule?: (moduleSpecifier: string) => Promise<WebLlmModule>;
  checkCapability?: () => Promise<RuntimeCapability>;
};

function toProviderMetadata(modelId: string): AiGenerationProviderMetadata {
  return {
    id: "webllm",
    model: modelId,
    label: `webllm:${modelId}`,
    path: "local",
  };
}

function createSnapshot(
  status: LocalAiRuntimeStatus,
  provider: AiGenerationProviderMetadata,
  params?: {
    progressLabel?: string | null;
    error?: LocalAiRuntimeError | null;
  },
): LocalAiRuntimeSnapshot {
  return {
    status,
    provider,
    progressLabel: params?.progressLabel ?? null,
    error: params?.error ?? null,
  };
}

function normalizeUnexpectedError(error: unknown): LocalAiRuntimeError {
  if (error instanceof LocalAiRuntimeBootstrapError) {
    return error.details;
  }

  return {
    code: "bootstrap_failed",
    message: error instanceof Error ? error.message : "Local AI runtime bootstrap failed.",
    retryable: true,
  };
}

function formatProgress(progress: InitProgress | undefined): string | null {
  if (!progress) {
    return null;
  }

  const text = progress.text?.trim();
  if (text) {
    return text;
  }

  if (typeof progress.progress === "number" && Number.isFinite(progress.progress)) {
    const clamped = Math.max(0, Math.min(100, Math.round(progress.progress * 100)));
    return `Loading model (${clamped}%)`;
  }

  return null;
}

function defaultModuleLoader(moduleSpecifier: string): Promise<WebLlmModule> {
  if (moduleSpecifier === "@mlc-ai/web-llm") {
    return import("@mlc-ai/web-llm") as unknown as Promise<WebLlmModule>;
  }

  return import(/* @vite-ignore */ moduleSpecifier) as Promise<WebLlmModule>;
}

export async function checkWebLlmRuntimeCapability(
  browser: BrowserLike = globalThis as BrowserLike,
): Promise<RuntimeCapability> {
  if (browser.isSecureContext === false) {
    return {
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime requires a secure browser context.",
        retryable: false,
      },
    };
  }

  if (typeof browser.Worker !== "function") {
    return {
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime requires Web Worker support.",
        retryable: false,
      },
    };
  }

  if (typeof browser.WebAssembly !== "object") {
    return {
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime requires WebAssembly support.",
        retryable: false,
      },
    };
  }

  const requestAdapter = browser.navigator?.gpu?.requestAdapter;
  if (typeof requestAdapter !== "function") {
    return {
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime requires WebGPU support.",
        retryable: false,
      },
    };
  }

  try {
    const adapter = await requestAdapter.call(browser.navigator?.gpu);
    if (!adapter) {
      return {
        supported: false,
        error: {
          code: "unsupported_environment",
          message: "Local AI runtime could not acquire a compatible WebGPU adapter.",
          retryable: false,
        },
      };
    }
  } catch {
    return {
      supported: false,
      error: {
        code: "unsupported_environment",
        message: "Local AI runtime could not access the browser WebGPU adapter.",
        retryable: false,
      },
    };
  }

  return { supported: true };
}

class LocalAiRuntimeBootstrapError extends Error {
  readonly details: LocalAiRuntimeError;

  constructor(details: LocalAiRuntimeError) {
    super(details.message);
    this.name = "LocalAiRuntimeBootstrapError";
    this.details = details;
  }
}

async function maybeUnloadEngine(engine: WebLlmEngine | null): Promise<void> {
  if (!engine?.unload) {
    return;
  }

  await engine.unload();
}

async function runWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    throw new LocalAiRuntimeBootstrapError({
      code: "bootstrap_cancelled",
      message: "Local AI runtime initialization was cancelled.",
      retryable: true,
    });
  }

  return await new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new LocalAiRuntimeBootstrapError({
          code: "bootstrap_timeout",
          message: "Local AI runtime initialization timed out.",
          retryable: true,
        }),
      );
    }, timeoutMs);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(
        new LocalAiRuntimeBootstrapError({
          code: "bootstrap_cancelled",
          message: "Local AI runtime initialization was cancelled.",
          retryable: true,
        }),
      );
    };

    if (signal) {
      signal.addEventListener("abort", handleAbort, { once: true });
    }

    operation.then(
      (value) => {
        window.clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", handleAbort);
        }
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", handleAbort);
        }
        reject(error);
      },
    );
  });
}

export class LocalAiRuntimeController {
  private readonly getConfig: () => LocalAiRuntimeConfig;
  private readonly loadModule: (moduleSpecifier: string) => Promise<WebLlmModule>;
  private readonly checkCapability: () => Promise<RuntimeCapability>;
  private readonly listeners = new Set<() => void>();
  private engine: WebLlmEngine | null = null;
  private bootstrapPromise: Promise<void> | null = null;
  private snapshot: LocalAiRuntimeSnapshot;

  constructor(deps: RuntimeDependencies = {}) {
    this.getConfig = deps.getConfig ?? getLocalAiRuntimeConfig;
    this.loadModule = deps.loadModule ?? defaultModuleLoader;
    this.checkCapability = deps.checkCapability ?? (() => checkWebLlmRuntimeCapability());

    const config = this.getConfig();
    this.snapshot = createSnapshot("idle", toProviderMetadata(config.modelId));
  }

  getSnapshot = (): LocalAiRuntimeSnapshot => this.snapshot;

  getEngine = (): WebLlmEngine | null => this.engine;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setSnapshot(snapshot: LocalAiRuntimeSnapshot): void {
    this.snapshot = snapshot;
    this.emit();
  }

  async initialize(options: { signal?: AbortSignal } = {}): Promise<LocalAiRuntimeSnapshot> {
    if (this.snapshot.status === "ready") {
      return this.snapshot;
    }

    if (this.bootstrapPromise) {
      await this.bootstrapPromise;
      return this.snapshot;
    }

    const config = this.getConfig();
    const provider = toProviderMetadata(config.modelId);
    this.setSnapshot(createSnapshot("idle", provider));

    if (!config.enabled) {
      this.setSnapshot(
        createSnapshot("unsupported", provider, {
          error: {
            code: "feature_disabled",
            message: "Local AI mode is disabled in the current frontend runtime configuration.",
            retryable: false,
          },
        }),
      );
      return this.snapshot;
    }

    if (!config.modelId.trim()) {
      this.setSnapshot(
        createSnapshot("failed", provider, {
          error: {
            code: "invalid_configuration",
            message: "Local AI runtime model configuration is missing.",
            retryable: false,
          },
        }),
      );
      return this.snapshot;
    }

    const capability = await this.checkCapability();
    if (!capability.supported) {
      this.setSnapshot(
        createSnapshot("unsupported", provider, {
          error: capability.error,
        }),
      );
      return this.snapshot;
    }

    this.setSnapshot(createSnapshot("loading-model", provider));

    this.bootstrapPromise = (async () => {
      let nextEngine: WebLlmEngine | null = null;
      try {
        const module = await this.loadModule(config.moduleSpecifier);
        nextEngine = await runWithTimeout(
          module.CreateMLCEngine(config.modelId, {
            initProgressCallback: (progress) => {
              this.setSnapshot(
                createSnapshot("loading-model", provider, {
                  progressLabel: formatProgress(progress),
                }),
              );
            },
          }),
          config.bootstrapTimeoutMs,
          options.signal,
        );

        this.engine = nextEngine;
        this.setSnapshot(createSnapshot("ready", provider));
      } catch (error) {
        await maybeUnloadEngine(nextEngine);
        this.engine = null;
        this.setSnapshot(
          createSnapshot("failed", provider, {
            error: normalizeUnexpectedError(error),
          }),
        );
        throw error;
      } finally {
        this.bootstrapPromise = null;
      }
    })();

    try {
      await this.bootstrapPromise;
    } catch {
      return this.snapshot;
    }

    return this.snapshot;
  }

  async reset(): Promise<LocalAiRuntimeSnapshot> {
    await maybeUnloadEngine(this.engine);
    this.engine = null;

    const config = this.getConfig();
    const nextSnapshot = createSnapshot("idle", toProviderMetadata(config.modelId));
    this.setSnapshot(nextSnapshot);
    return nextSnapshot;
  }
}

let defaultLocalAiRuntimeController = new LocalAiRuntimeController();

export function getLocalAiRuntimeController(): LocalAiRuntimeController {
  return defaultLocalAiRuntimeController;
}

export function setLocalAiRuntimeControllerForTests(
  controller: LocalAiRuntimeController,
): void {
  defaultLocalAiRuntimeController = controller;
}

export function useLocalAiRuntime() {
  const controller = getLocalAiRuntimeController();
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  const initialize = useCallback((options?: { signal?: AbortSignal }) => controller.initialize(options), [controller]);
  const reset = useCallback(() => controller.reset(), [controller]);

  return {
    ...snapshot,
    initialize,
    reset,
  };
}
