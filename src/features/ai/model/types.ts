import type { NotebookBlock, TextBlock } from "@/entities/notebook";
import type {
  AiGenerationErrorCode,
  AiGenerationErrorKind,
  AiGenerationProvider,
  AiGenerationProviderMetadata,
  AiGenerationWarning,
  AiRelevantBlock,
  AiScope,
} from "../api/provider";
import type {
  LocalAiRuntimeError,
  LocalAiRuntimeErrorCode,
  LocalAiRuntimeSnapshot,
  LocalAiRuntimeStatus,
} from "./localRuntime";

export type AiRequestStatus = "idle" | "submitting" | "success" | "error";

export type BlockAiErrorState = {
  code: AiGenerationErrorCode;
  message: string;
  retryable: boolean;
  requestId: string | null;
  kind: AiGenerationErrorKind;
  provider: AiGenerationProviderMetadata | null;
};

export type BlockAiState = {
  status: AiRequestStatus;
  derivedPrompt: string;
  scope: AiScope;
  lastRequestId: string | null;
  lastResponseCode: string | null;
  provider: AiGenerationProviderMetadata | null;
  warnings: AiGenerationWarning[];
  error: BlockAiErrorState | null;
};

export type NotebookLocalAiSurfaceStatus =
  | "disabled"
  | "idle"
  | "unsupported"
  | "preparing"
  | "ready"
  | "failed";

export type BlockAiActionProps = {
  notebookId: string | null;
  serverNotebookId: string | null;
  notebookTitle: string;
  blocks: NotebookBlock[];
  block: TextBlock;
  onInsertCode?: (sourceBlockId: string, code: string) => void;
  provider?: AiGenerationProvider;
  localProvider?: AiGenerationProvider;
};

export type {
  AiRelevantBlock,
  AiScope,
  LocalAiRuntimeError,
  LocalAiRuntimeErrorCode,
  LocalAiRuntimeSnapshot,
  LocalAiRuntimeStatus,
};
