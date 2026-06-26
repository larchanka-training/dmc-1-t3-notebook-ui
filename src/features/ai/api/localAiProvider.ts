import { getLocalAiRuntimeConfig } from "@/shared/config";
import {
  getLocalAiRuntimeController,
  type LocalAiRuntimeError,
  type WebLlmEngine,
} from "../model/localRuntime";
import {
  AiGenerationError,
  type AiGenerationErrorCode,
  type AiGenerationProvider,
  type AiGenerationRequest,
  type AiGenerationSuccess,
} from "./provider";

type WebLlmMessageRole = "system" | "user" | "assistant";

type WebLlmMessage = {
  role: WebLlmMessageRole;
  content: string;
};

type WebLlmResponseTextPart = {
  text?: string;
};

type WebLlmChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | WebLlmResponseTextPart[] | null;
    };
  }>;
};

type WebLlmChatApi = {
  create: (params: {
    messages: WebLlmMessage[];
    stream?: boolean;
  }) => Promise<WebLlmChatCompletionResponse>;
};

type WebLlmChatEngine = WebLlmEngine & {
  chat?: {
    completions?: WebLlmChatApi;
  };
};

const SYSTEM_PROMPT = [
  "You generate JavaScript code for a notebook.",
  "Return only plain JavaScript code.",
  "Do not include markdown fences, explanations, or commentary.",
].join(" ");

const CODE_FENCE_RE = /```(?:javascript|js)?\s*([\s\S]*?)```/i;
const GENERIC_FENCE_RE = /```[\w-]*\s*([\s\S]*?)```/i;
const CODE_LINE_RE =
  /^(?:\/\/|\/\*|\*\/|\*|const\b|let\b|var\b|function\b|async\b|class\b|if\b|for\b|while\b|switch\b|try\b|catch\b|finally\b|return\b|import\b|export\b|await\b|[A-Za-z_$][\w$]*\s*(?:[.(=[]|$)|[}\])].*|[`"'[{(])/;

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `webllm_${Date.now()}`;
}

function formatRelevantBlocks(request: AiGenerationRequest): string {
  const relevantBlocks = request.context.relevantBlocks ?? [];
  if (relevantBlocks.length === 0) {
    return "None";
  }

  return relevantBlocks
    .map((block) => {
      const title = `${block.type.toUpperCase()} BLOCK ${block.blockId}`;
      return `${title}\n${block.content}`;
    })
    .join("\n\n");
}

function buildPrompt(request: AiGenerationRequest): string {
  const notebookTitle = request.context.notebookTitle?.trim();

  return [
    "Task:",
    request.prompt,
    "",
    "Source text:",
    request.context.sourceText,
    "",
    `Scope: ${request.context.scope ?? "this"}`,
    `Insertion strategy: ${request.insertionStrategy}`,
    notebookTitle ? `Notebook title: ${notebookTitle}` : null,
    "",
    "Relevant notebook context:",
    formatRelevantBlocks(request),
  ]
    .filter((section): section is string => section !== null)
    .join("\n");
}

function extractMessageContent(response: WebLlmChatCompletionResponse): string | null {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const combined = content
      .map((part) => part.text?.trim())
      .filter((part): part is string => Boolean(part))
      .join("\n")
      .trim();

    return combined.length > 0 ? combined : null;
  }

  return null;
}

function looksLikeCodeLine(line: string): boolean {
  return CODE_LINE_RE.test(line.trim());
}

function stripNonCodeNoise(text: string): string {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  while (lines.length > 0 && !looksLikeCodeLine(lines[0] ?? "")) {
    lines.shift();
  }

  while (lines.length > 0 && !looksLikeCodeLine(lines[lines.length - 1] ?? "")) {
    lines.pop();
  }

  return lines.join("\n").trim();
}

function extractCodeCandidate(raw: string): string | null {
  const fencedMatch = raw.match(CODE_FENCE_RE) ?? raw.match(GENERIC_FENCE_RE);
  const candidate = fencedMatch?.[1] ?? stripNonCodeNoise(raw);
  const normalized = candidate.trim();

  return normalized.length > 0 ? normalized : null;
}

function validateJavaScript(code: string): boolean {
  try {
    // Parse as a function body to preserve the current notebook code semantics.
    new Function(code);
    return true;
  } catch {
    return false;
  }
}

function mapRuntimeError(error: LocalAiRuntimeError): AiGenerationError {
  const codeMap: Record<LocalAiRuntimeError["code"], AiGenerationErrorCode> = {
    feature_disabled: "AI_LOCAL_UNSUPPORTED",
    unsupported_environment: "AI_LOCAL_UNSUPPORTED",
    bootstrap_failed: "AI_LOCAL_BOOTSTRAP_FAILED",
    bootstrap_timeout: "AI_LOCAL_TIMEOUT",
    bootstrap_cancelled: "AI_LOCAL_CANCELLED",
    invalid_configuration: "AI_LOCAL_BOOTSTRAP_FAILED",
  };

  return new AiGenerationError(error.message, {
    code: codeMap[error.code],
    retryable: error.retryable,
    requestId: null,
    kind: "provider",
  });
}

function toUnsupportedResponseError(): AiGenerationError {
  return new AiGenerationError("Local AI runtime is unavailable in this browser.", {
    code: "AI_LOCAL_UNSUPPORTED",
    retryable: false,
    requestId: null,
    kind: "provider",
  });
}

function toInvalidResponseError(message: string): AiGenerationError {
  return new AiGenerationError(message, {
    code: "AI_LOCAL_RESPONSE_INVALID",
    retryable: true,
    requestId: null,
    kind: "response",
  });
}

function getChatApi(engine: WebLlmEngine): WebLlmChatApi {
  const chat = (engine as WebLlmChatEngine).chat?.completions;
  if (!chat) {
    throw new AiGenerationError("Local AI runtime did not expose a completion API.", {
      code: "AI_LOCAL_BOOTSTRAP_FAILED",
      retryable: true,
      requestId: null,
      kind: "provider",
    });
  }

  return chat;
}

class LocalAiGenerationProvider implements AiGenerationProvider {
  async generate(
    request: AiGenerationRequest,
    options: { signal?: AbortSignal } = {},
  ): Promise<AiGenerationSuccess> {
    const runtime = getLocalAiRuntimeController();
    const snapshot = await runtime.initialize(options);

    if (snapshot.status !== "ready") {
      if (snapshot.error) {
        throw mapRuntimeError(snapshot.error);
      }

      throw toUnsupportedResponseError();
    }

    const engine = runtime.getEngine();
    if (!engine) {
      throw new AiGenerationError("Local AI runtime was not ready for generation.", {
        code: "AI_LOCAL_BOOTSTRAP_FAILED",
        retryable: true,
        requestId: null,
        kind: "provider",
      });
    }

    if (options.signal?.aborted) {
      throw new AiGenerationError("Local AI generation was cancelled.", {
        code: "AI_LOCAL_CANCELLED",
        retryable: true,
        requestId: null,
        kind: "provider",
      });
    }

    const chat = getChatApi(engine);
    const response = await chat.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(request) },
      ],
      stream: false,
    });

    const rawContent = extractMessageContent(response);
    if (!rawContent) {
      throw toInvalidResponseError("Local AI returned an empty response.");
    }

    const code = extractCodeCandidate(rawContent);
    if (!code) {
      throw toInvalidResponseError("Local AI returned no usable JavaScript code.");
    }

    if (!validateJavaScript(code)) {
      throw toInvalidResponseError("Local AI returned unusable JavaScript code.");
    }

    return {
      requestId: createRequestId(),
      code,
      provider: snapshot.provider,
      warnings: [],
    };
  }
}

export const localAiGenerationProvider: AiGenerationProvider =
  new LocalAiGenerationProvider();

export function getLocalAiGenerationTimeoutMs(): number {
  return getLocalAiRuntimeConfig().bootstrapTimeoutMs;
}
