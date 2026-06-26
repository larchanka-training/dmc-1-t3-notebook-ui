import { ApiError } from "@/shared/api";
import { generateCodeBlock } from "./aiApi";
import {
  AiGenerationError,
  type AiGenerationErrorCode,
  type AiGenerationErrorKind,
  type AiGenerationProvider,
  type AiGenerationProviderMetadata,
  type AiGenerationRequest,
  type AiGenerationSuccess,
} from "./provider";

function toProviderMetadata(params: {
  name: string;
  model: string;
}): AiGenerationProviderMetadata {
  return {
    id: params.name === "webllm" ? "webllm" : "bedrock",
    model: params.model,
    label: `${params.name}:${params.model}`,
    path: "backend",
  };
}

function mapAiErrorKind(code: AiGenerationErrorCode): AiGenerationErrorKind {
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

function normalizeProviderError(error: unknown): AiGenerationError {
  if (error instanceof AiGenerationError) {
    return error;
  }

  if (error instanceof ApiError) {
    const code = error.code as AiGenerationErrorCode;
    return new AiGenerationError(error.message, {
      code,
      retryable: error.retryable,
      requestId: error.requestId,
      kind: mapAiErrorKind(code),
    });
  }

  return new AiGenerationError("The AI request could not be completed.", {
    code: "request_failed",
    retryable: true,
    requestId: null,
    kind: "unknown",
  });
}

class BackendAiGenerationProvider implements AiGenerationProvider {
  async generate(
    request: AiGenerationRequest,
    options?: { signal?: AbortSignal },
  ): Promise<AiGenerationSuccess> {
    void options;
    try {
      const response = await generateCodeBlock(request);
      const provider = toProviderMetadata(response.provider);

      return {
        requestId: response.requestId,
        code: response.code,
        provider,
        warnings: response.warnings,
      };
    } catch (error) {
      throw normalizeProviderError(error);
    }
  }
}

export const backendAiGenerationProvider: AiGenerationProvider =
  new BackendAiGenerationProvider();
