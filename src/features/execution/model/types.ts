import type { OutputItem } from "@/entities/output";

export type ExecutionCommandType =
  | "run-current"
  | "run-all"
  | "run-from-here"
  | "reset"
  | "stop";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "stopping"
  | "error"
  | "canceled"
  | "timeout";

export type ExecutionOutput = OutputItem;

export type BlockOutput = OutputItem;

export type RuntimeSourceBlock = {
  blockId: string;
  source: string;
};

export type ExecutionErrorKind =
  | "syntax"
  | "runtime"
  | "timeout"
  | "canceled"
  | "bridge";

export type NormalizedExecutionError = {
  kind: ExecutionErrorKind;
  name?: string;
  message: string;
  stack?: string;
};

export type ExecutionRequest =
  | {
      command: "run-current";
      executionId: string;
      targetBlockId: string;
    }
  | {
      command: "run-all";
      executionId: string;
      targetBlockId: string;
    }
  | {
      command: "run-from-here";
      executionId: string;
      targetBlockId: string;
    }
  | {
      command: "reset";
      executionId: string;
    }
  | {
      command: "stop";
      executionId: string;
    };

export type RuntimeToAppMessage =
  | {
      type: "execution-started";
      executionId: string;
      blockId: string;
    }
  | {
      type: "execution-output";
      executionId: string;
      blockId: string;
      output: ExecutionOutput;
    }
  | {
      type: "execution-error";
      executionId: string;
      blockId: string;
      error: NormalizedExecutionError;
    }
  | {
      type: "execution-complete";
      executionId: string;
      blockId: string;
    };

export type AppToRuntimeMessage =
  | {
      type: "RUN_BLOCKS";
      executionId: string;
      blocks: RuntimeSourceBlock[];
    }
  | {
      type: "RESET_SESSION";
      executionId: string;
    }
  | {
      type: "TERMINATE_SESSION";
      executionId: string;
    };

export type RuntimeExecutionRequest = Extract<
  ExecutionRequest,
  { command: "run-current" | "run-all" | "run-from-here" }
> & {
  blocks: RuntimeSourceBlock[];
  timeoutMs?: number;
};

export interface ExecutionState {
  status: ExecutionStatus;
  activeExecutionId: string | null;
  activeCommand: ExecutionCommandType | null;
  targetBlockId: string | null;
  runningBlockIds: string[];
  outputs: Record<string, ExecutionOutput[]>;
  error: NormalizedExecutionError | null;
}

export const initialExecutionState: ExecutionState = {
  status: "idle",
  activeExecutionId: null,
  activeCommand: null,
  targetBlockId: null,
  runningBlockIds: [],
  outputs: {},
  error: null,
};

export interface ExecutionSlice {
  execution: ExecutionState;
  startExecution: (request: ExecutionRequest) => void;
  markBlockRunning: (executionId: string, blockId: string) => void;
  clearBlockOutputsForRun: (executionId: string, blockId: string) => void;
  appendBlockOutput: (
    executionId: string,
    blockId: string,
    output: ExecutionOutput,
  ) => void;
  recordExecutionError: (
    executionId: string,
    error: NormalizedExecutionError,
    blockId?: string,
  ) => void;
  completeBlockExecution: (executionId: string, blockId: string) => void;
  resetExecutionState: () => void;
  stopExecution: () => void;
  disposeExecutionSession: () => void;
}
