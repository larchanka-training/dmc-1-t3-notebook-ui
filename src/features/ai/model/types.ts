import type { NotebookBlock, TextBlock } from "@/entities/notebook";
import type { AiWarning } from "../api/aiApi";

export type AiRequestStatus = "idle" | "submitting" | "success" | "error";

export type AiScope = "this" | "notebook";

export type AiErrorCode =
  | "AI_INVALID_REQUEST"
  | "AI_FORBIDDEN"
  | "AI_PROMPT_REJECTED"
  | "AI_PROMPT_UNSAFE"
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_PROVIDER_TIMEOUT"
  | "AI_RESPONSE_INVALID"
  | "AI_CODE_EXTRACTION_FAILED"
  | "AI_CODE_SYNTAX_INVALID"
  | "invalid_response"
  | "request_failed";

export type AiErrorClass =
  | "validation"
  | "forbidden"
  | "policy"
  | "provider"
  | "response"
  | "unknown";

export type BlockAiErrorState = {
  code: AiErrorCode;
  message: string;
  retryable: boolean;
  requestId: string | null;
  kind: AiErrorClass;
};

export type BlockAiState = {
  status: AiRequestStatus;
  derivedPrompt: string;
  scope: AiScope;
  lastRequestId: string | null;
  lastResponseCode: string | null;
  warnings: AiWarning[];
  error: BlockAiErrorState | null;
};

export type AiRelevantBlock = {
  blockId: string;
  type: "text" | "code";
  content: string;
};

export type BlockAiActionProps = {
  notebookId: string | null;
  notebookTitle: string;
  blocks: NotebookBlock[];
  block: TextBlock;
  onInsertCode?: (sourceBlockId: string, code: string) => void;
};
