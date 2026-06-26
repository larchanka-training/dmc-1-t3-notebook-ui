import { useCallback, useMemo, useState } from "react";
import {
  AiGenerationError,
  backendAiGenerationProvider,
  localAiGenerationProvider,
  type AiGenerationProviderMetadata,
} from "../api";
import { buildAiRequestContext, parseAiSourceText } from "./contextBuilder";
import { useLocalAiRuntime } from "./localRuntime";
import { getLocalAiRuntimeConfig } from "@/shared/config";
import type {
  AiScope,
  BlockAiErrorState,
  BlockAiState,
  BlockAiActionProps,
} from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isServerBackedNotebookId(notebookId: string | null): notebookId is string {
  return typeof notebookId === "string" && UUID_RE.test(notebookId);
}

function resolveAiNotebookId(
  notebookId: string | null,
  serverNotebookId: string | null,
): string | null {
  if (isServerBackedNotebookId(serverNotebookId)) {
    return serverNotebookId;
  }
  if (isServerBackedNotebookId(notebookId)) {
    return notebookId;
  }
  return null;
}

function resolveLocalAiNotebookId(
  notebookId: string | null,
  serverNotebookId: string | null,
): string | null {
  if (typeof notebookId === "string" && notebookId.length > 0) {
    return notebookId;
  }

  if (typeof serverNotebookId === "string" && serverNotebookId.length > 0) {
    return serverNotebookId;
  }

  return null;
}

const BACKEND_PENDING_PROVIDER: AiGenerationProviderMetadata = {
  id: "bedrock",
  model: "server-managed",
  label: "bedrock",
  path: "backend",
};

function toAiErrorState(error: unknown): BlockAiErrorState {
  if (error instanceof AiGenerationError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      requestId: error.requestId,
      kind: error.kind,
      provider: error.provider,
    };
  }

  return {
    code: "request_failed",
    message: "The AI request could not be completed.",
    retryable: true,
    requestId: null,
    kind: "unknown",
    provider: null,
  };
}

function withProviderFallback(
  error: BlockAiErrorState,
  provider: AiGenerationProviderMetadata | null,
): BlockAiErrorState {
  if (error.provider) {
    return error;
  }

  return {
    ...error,
    provider,
  };
}

function createIdleState(derivedPrompt: string, scope: AiScope): BlockAiState {
  return {
    status: "idle",
    derivedPrompt,
    scope,
    lastRequestId: null,
    lastResponseCode: null,
    provider: null,
    warnings: [],
    error: null,
  };
}

function errorKindLabel(kind: BlockAiErrorState["kind"]): string {
  switch (kind) {
    case "validation":
      return "Validation";
    case "forbidden":
      return "Access";
    case "policy":
      return "Policy";
    case "provider":
      return "Provider";
    case "response":
      return "Response";
    default:
      return "Request";
  }
}

function formatProviderLabel(provider: AiGenerationProviderMetadata | null): string | null {
  if (!provider) {
    return null;
  }

  return provider.id === "webllm" ? provider.label : provider.id;
}

function toBackendValidationError(
  provider: AiGenerationProviderMetadata | null,
): BlockAiErrorState {
  return {
    code: "AI_INVALID_REQUEST",
    message: "AI generation requires a synced notebook available on the server.",
    retryable: false,
    requestId: null,
    kind: "validation",
    provider,
  };
}

function toLocalValidationError(
  provider: AiGenerationProviderMetadata | null,
): BlockAiErrorState {
  return {
    code: "AI_INVALID_REQUEST",
    message: "Local AI generation requires a notebook loaded in the editor.",
    retryable: false,
    requestId: null,
    kind: "validation",
    provider,
  };
}

function createGenerationRequest(params: {
  notebookId: string;
  blockId: string;
  prompt: string;
  scope: AiScope;
  sourceText: string;
  notebookTitle?: string;
  relevantBlocks: ReturnType<typeof buildAiRequestContext>["relevantBlocks"];
}) {
  return {
    notebookId: params.notebookId,
    sourceBlockId: params.blockId,
    mode: "generate" as const,
    prompt: params.prompt,
    context: {
      language: "javascript" as const,
      scope: params.scope,
      sourceText: params.sourceText,
      notebookTitle: params.notebookTitle,
      relevantBlocks: params.relevantBlocks,
    },
    insertionStrategy: "next-empty-or-new-after-source" as const,
  };
}

export function useBlockAiAction({
  notebookId,
  serverNotebookId,
  notebookTitle,
  blocks,
  block,
  onInsertCode,
  provider = backendAiGenerationProvider,
  localProvider = localAiGenerationProvider,
}: BlockAiActionProps) {
  const localRuntime = useLocalAiRuntime();
  const localRuntimeConfig = useMemo(() => getLocalAiRuntimeConfig(), []);
  const derived = useMemo(
    () => parseAiSourceText(block.content.markdown),
    [block.content.markdown],
  );
  const [state, setState] = useState<BlockAiState>(() =>
    createIdleState(derived.prompt, derived.scope),
  );
  const backendNotebookId = useMemo(
    () => resolveAiNotebookId(notebookId, serverNotebookId),
    [notebookId, serverNotebookId],
  );
  const localNotebookId = useMemo(
    () => resolveLocalAiNotebookId(notebookId, serverNotebookId),
    [notebookId, serverNotebookId],
  );
  const isBackendNotebookEligible = backendNotebookId !== null;
  const isLocalNotebookEligible = localNotebookId !== null;
  const isUnsyncedLocalDraft = !isBackendNotebookEligible && isLocalNotebookEligible;

  const runGenerate = useCallback(async (mode: "backend" | "local") => {
    const aiNotebookId = mode === "local" ? localNotebookId : backendNotebookId;
    const context = buildAiRequestContext({
      blocks,
      sourceBlock: block,
      notebookTitle,
    });
    const selectedProvider =
      mode === "local" ? localRuntime.provider : BACKEND_PENDING_PROVIDER;

    setState((previous) => ({
      ...previous,
      status: "submitting",
      derivedPrompt: context.prompt,
      scope: context.scope,
      provider: selectedProvider,
      error: null,
      warnings: [],
    }));

    if (aiNotebookId === null) {
      setState((previous) => ({
        ...previous,
        status: "error",
        provider: selectedProvider,
        error:
          mode === "local"
            ? toLocalValidationError(selectedProvider)
            : toBackendValidationError(selectedProvider),
      }));
      return;
    }

    try {
      const response = await (mode === "local" ? localProvider : provider).generate(
        createGenerationRequest({
          notebookId: aiNotebookId,
          blockId: block.id,
          prompt: context.prompt,
          scope: context.scope,
          sourceText: context.sourceText,
          notebookTitle: context.notebookTitle,
          relevantBlocks: context.relevantBlocks,
        }),
      );

      onInsertCode?.(block.id, response.code);

      setState({
        status: "success",
        derivedPrompt: context.prompt,
        scope: context.scope,
        lastRequestId: response.requestId,
        lastResponseCode: response.code,
        provider: response.provider,
        warnings: response.warnings,
        error: null,
      });
    } catch (error) {
      const nextError = withProviderFallback(toAiErrorState(error), selectedProvider);
      setState((previous) => ({
        ...previous,
        status: "error",
        lastRequestId: nextError.requestId,
        provider: nextError.provider,
        error: nextError,
      }));
    }
  }, [
    block,
    blocks,
    backendNotebookId,
    localProvider,
    localNotebookId,
    localRuntime.provider,
    notebookTitle,
    onInsertCode,
    provider,
  ]);

  const prepareLocalMode = useCallback(async () => {
    await localRuntime.initialize();
  }, [localRuntime]);

  const canGenerate = state.status !== "submitting" && derived.prompt.length > 0;
  const isSubmitting = state.status === "submitting";
  const localModeEnabled = localRuntimeConfig.enabled;
  const canPrepareLocal =
    localModeEnabled &&
    state.status !== "submitting" &&
    (localRuntime.status === "idle" || localRuntime.status === "failed");
  const canGenerateLocally =
    localModeEnabled &&
    state.status !== "submitting" &&
    derived.prompt.length > 0 &&
    localRuntime.status === "ready";
  const canRetryLocally =
    canGenerateLocally && state.status === "error" && Boolean(state.error?.retryable);
  const successPreview = state.status === "success" ? state.lastResponseCode : null;
  const providerLabel = formatProviderLabel(state.provider);
  const statusLabelBase =
    state.status === "submitting"
      ? "Submitting"
      : state.status === "success"
        ? "Ready"
        : state.status === "error"
          ? "Failed"
          : "Idle";
  const statusLabel = providerLabel
    ? `${statusLabelBase} via ${providerLabel}`
    : statusLabelBase;
  const errorSummary = state.error
    ? `${errorKindLabel(state.error.kind)}${providerLabel ? ` via ${providerLabel}` : ""}: ${state.error.message}`
    : null;
  const localRuntimeSummary =
    localRuntime.status === "loading-model"
      ? localRuntime.progressLabel ?? "Preparing WebLLM local mode..."
      : localRuntime.status === "ready"
        ? isUnsyncedLocalDraft
          ? `Backend AI requires a synced notebook. Local mode ready via ${localRuntime.provider.label}.`
          : `Local mode ready via ${localRuntime.provider.label}.`
        : !localModeEnabled
          ? "Local WebLLM is disabled in the current frontend runtime configuration."
          : isUnsyncedLocalDraft
            ? localRuntime.error?.message ??
              "Backend AI requires a synced notebook. Prepare WebLLM to generate locally for this draft."
            : localRuntime.error?.message ?? "Local WebLLM mode is available on demand.";

  return {
    status: state.status,
    statusLabel,
    scope: derived.scope,
    isSubmitting,
    canGenerate,
    successPreview,
    warnings: state.warnings,
    provider: state.provider,
    error: state.error,
    errorSummary,
    localModeEnabled: true,
    localRuntimeStatus: localRuntime.status,
    localRuntimeSummary,
    canPrepareLocal,
    canGenerateLocally,
    canRetryLocally,
    requestId: state.lastRequestId,
    onGenerate: () => runGenerate("backend"),
    onGenerateLocally: () => runGenerate("local"),
    onPrepareLocalMode: prepareLocalMode,
  };
}
