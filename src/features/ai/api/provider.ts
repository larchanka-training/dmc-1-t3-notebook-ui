export type AiScope = "this" | "notebook";

export type AiGenerationProviderId = "bedrock" | "webllm";

export type AiGenerationProviderPath = "backend" | "local";

export type AiGenerationWarning = {
  code: string;
  message: string;
};

export type AiRelevantBlock = {
  blockId: string;
  type: "text" | "code";
  content: string;
};

export type AiGenerationRequest = {
  notebookId: string;
  sourceBlockId: string;
  mode: "generate" | "revise";
  prompt: string;
  context: {
    language: "javascript";
    scope?: AiScope;
    sourceText: string;
    notebookTitle?: string;
    globalsSummary?: string[];
    relevantBlocks?: AiRelevantBlock[];
  };
  insertionStrategy: "next-empty-or-new-after-source";
};

export type AiGenerationProviderMetadata = {
  id: AiGenerationProviderId;
  model: string;
  label: string;
  path: AiGenerationProviderPath;
};

export type AiGenerationSuccess = {
  requestId: string;
  code: string;
  provider: AiGenerationProviderMetadata;
  warnings: AiGenerationWarning[];
};

export type AiGenerationErrorCode =
  | "AI_INVALID_REQUEST"
  | "AI_FORBIDDEN"
  | "AI_PROMPT_REJECTED"
  | "AI_PROMPT_UNSAFE"
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_PROVIDER_TIMEOUT"
  | "AI_RESPONSE_INVALID"
  | "AI_CODE_EXTRACTION_FAILED"
  | "AI_CODE_SYNTAX_INVALID"
  | "AI_LOCAL_UNSUPPORTED"
  | "AI_LOCAL_BOOTSTRAP_FAILED"
  | "AI_LOCAL_TIMEOUT"
  | "AI_LOCAL_CANCELLED"
  | "AI_LOCAL_RESPONSE_INVALID"
  | "invalid_response"
  | "request_failed";

export type AiGenerationErrorKind =
  | "validation"
  | "forbidden"
  | "policy"
  | "provider"
  | "response"
  | "unknown";

export type AiGenerationErrorDetails = {
  code: AiGenerationErrorCode;
  retryable: boolean;
  requestId?: string | null;
  kind: AiGenerationErrorKind;
  provider?: AiGenerationProviderMetadata | null;
};

export class AiGenerationError extends Error {
  readonly code: AiGenerationErrorCode;
  readonly retryable: boolean;
  readonly requestId: string | null;
  readonly kind: AiGenerationErrorKind;
  readonly provider: AiGenerationProviderMetadata | null;

  constructor(message: string, details: AiGenerationErrorDetails) {
    super(message);
    this.name = "AiGenerationError";
    this.code = details.code;
    this.retryable = details.retryable;
    this.requestId = details.requestId ?? null;
    this.kind = details.kind;
    this.provider = details.provider ?? null;
  }
}

export interface AiGenerationProvider {
  generate(
    request: AiGenerationRequest,
    options?: { signal?: AbortSignal },
  ): Promise<AiGenerationSuccess>;
}
