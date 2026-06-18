import { useCallback, useMemo, useState } from "react";
import type { ApiError } from "@/shared/api";
import { generateCodeBlock } from "../api/aiApi";
import { buildAiRequestContext, parseAiSourceText } from "./contextBuilder";
import type {
  AiErrorClass,
  AiErrorCode,
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

function mapAiErrorKind(code: AiErrorCode): AiErrorClass {
  switch (code) {
    case "AI_INVALID_REQUEST":
      return "validation";
    case "AI_FORBIDDEN":
      return "forbidden";
    case "AI_PROMPT_REJECTED":
    case "AI_PROMPT_UNSAFE":
      return "policy";
    case "AI_PROVIDER_UNAVAILABLE":
    case "AI_PROVIDER_TIMEOUT":
      return "provider";
    case "AI_RESPONSE_INVALID":
    case "AI_CODE_EXTRACTION_FAILED":
    case "AI_CODE_SYNTAX_INVALID":
    case "invalid_response":
      return "response";
    default:
      return "unknown";
  }
}

function toAiErrorState(error: unknown): BlockAiErrorState {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "status" in error
  ) {
    const apiError = error as ApiError;
    const code = apiError.code as AiErrorCode;
    return {
      code,
      message: apiError.message,
      retryable: apiError.retryable,
      requestId: apiError.requestId,
      kind: mapAiErrorKind(code),
    };
  }

  return {
    code: "request_failed",
    message: "The AI request could not be completed.",
    retryable: true,
    requestId: null,
    kind: "unknown",
  };
}

function createIdleState(derivedPrompt: string, scope: AiScope): BlockAiState {
  return {
    status: "idle",
    derivedPrompt,
    scope,
    lastRequestId: null,
    lastResponseCode: null,
    warnings: [],
    error: null,
  };
}

function errorKindLabel(kind: AiErrorClass): string {
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

export function useBlockAiAction({
  notebookId,
  notebookTitle,
  blocks,
  block,
  onInsertCode,
}: BlockAiActionProps) {
  const derived = useMemo(
    () => parseAiSourceText(block.content.markdown),
    [block.content.markdown],
  );
  const [state, setState] = useState<BlockAiState>(() =>
    createIdleState(derived.prompt, derived.scope),
  );

  const runGenerate = useCallback(async () => {
    const context = buildAiRequestContext({
      blocks,
      sourceBlock: block,
      notebookTitle,
    });
    setState((previous) => ({
      ...previous,
      status: "submitting",
      derivedPrompt: context.prompt,
      scope: context.scope,
      error: null,
      warnings: [],
    }));

    if (!isServerBackedNotebookId(notebookId)) {
      setState((previous) => ({
        ...previous,
        status: "error",
        error: {
          code: "AI_INVALID_REQUEST",
          message: "AI generation requires a synced notebook available on the server.",
          retryable: false,
          requestId: null,
          kind: "validation",
        },
      }));
      return;
    }

    try {
      const response = await generateCodeBlock({
        notebookId,
        sourceBlockId: block.id,
        mode: "generate",
        prompt: context.prompt,
        context: {
          language: "javascript",
          scope: context.scope,
          sourceText: context.sourceText,
          notebookTitle: context.notebookTitle,
          relevantBlocks: context.relevantBlocks,
        },
        insertionStrategy: "next-empty-or-new-after-source",
      });

      onInsertCode?.(block.id, response.code);

      setState({
        status: "success",
        derivedPrompt: context.prompt,
        scope: context.scope,
        lastRequestId: response.requestId,
        lastResponseCode: response.code,
        warnings: response.warnings,
        error: null,
      });
    } catch (error) {
      const nextError = toAiErrorState(error);
      setState((previous) => ({
        ...previous,
        status: "error",
        lastRequestId: nextError.requestId,
        error: nextError,
      }));
    }
  }, [block, blocks, notebookId, notebookTitle, onInsertCode]);

  const canGenerate = state.status !== "submitting" && derived.prompt.length > 0;
  const isSubmitting = state.status === "submitting";
  const successPreview = state.status === "success" ? state.lastResponseCode : null;
  const statusLabel =
    state.status === "submitting"
      ? "Submitting"
      : state.status === "success"
        ? "Ready"
        : state.status === "error"
          ? "Failed"
          : "Idle";
  const errorSummary = state.error
    ? `${errorKindLabel(state.error.kind)}: ${state.error.message}`
    : null;

  return {
    status: state.status,
    statusLabel,
    scope: derived.scope,
    isSubmitting,
    canGenerate,
    successPreview,
    warnings: state.warnings,
    error: state.error,
    errorSummary,
    requestId: state.lastRequestId,
    onGenerate: runGenerate,
  };
}
