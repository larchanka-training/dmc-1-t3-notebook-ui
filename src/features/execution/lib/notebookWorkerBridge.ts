import type {
  AppToRuntimeMessage,
  ExecutionRequest,
  NormalizedExecutionError,
  RuntimeExecutionRequest,
  RuntimeToAppMessage,
} from "../model/types";

type RuntimeWorker = Pick<
  Worker,
  "onmessage" | "onerror" | "postMessage" | "terminate"
>;

type RuntimeBridgeHandlers = {
  onMessage: (message: RuntimeToAppMessage) => void;
  onError: (message: {
    executionId: string;
    blockId?: string;
    error: NormalizedExecutionError;
  }) => void;
};

type ActiveRunState = {
  executionId: string;
  targetBlockId: string;
  pendingBlockIds: Set<string>;
  timeoutMs: number;
};

const DEFAULT_TIMEOUT_MS = 5_000;

function createWorkerInstance(): RuntimeWorker {
  return new Worker(new URL("./notebookRuntimeWorker.ts", import.meta.url), {
    type: "module",
  });
}

export class NotebookWorkerBridge {
  private activeRun: ActiveRunState | null = null;
  private handlers: RuntimeBridgeHandlers | null = null;
  private worker: RuntimeWorker | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly workerFactory: () => RuntimeWorker = createWorkerInstance,
  ) {}

  async run(request: RuntimeExecutionRequest, handlers: RuntimeBridgeHandlers) {
    if (this.activeRun) {
      this.forceRestart();
    }

    this.handlers = handlers;
    this.ensureWorker();
    this.activeRun = {
      executionId: request.executionId,
      targetBlockId: request.targetBlockId,
      pendingBlockIds: new Set(request.blocks.map((block) => block.blockId)),
      timeoutMs: request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };

    if (request.command === "run-all") {
      this.postMessage({
        type: "RESET_SESSION",
        executionId: request.executionId,
      });
    }

    this.startTimeout();
    this.postMessage({
      type: "RUN_BLOCKS",
      executionId: request.executionId,
      blocks: request.blocks,
    });
  }

  resetSession(executionId: string) {
    if (!this.worker) {
      return;
    }

    this.postMessage({
      type: "RESET_SESSION",
      executionId,
    });
  }

  stop(executionId: string) {
    if (!this.activeRun || this.activeRun.executionId !== executionId) {
      return;
    }

    this.forceRestart();
  }

  dispose() {
    if (this.worker) {
      this.postMessage({
        type: "TERMINATE_SESSION",
        executionId: this.activeRun?.executionId ?? "session-dispose",
      });
    }

    this.forceRestart();
    this.handlers = null;
  }

  private completeActiveBlock(blockId: string) {
    if (!this.activeRun) {
      return;
    }

    this.activeRun.pendingBlockIds.delete(blockId);
    if (this.activeRun.pendingBlockIds.size === 0) {
      this.activeRun = null;
      this.clearTimeout();
    }
  }

  private ensureWorker() {
    if (this.worker) {
      return;
    }

    this.worker = this.workerFactory();
    this.worker.onmessage = (event: MessageEvent<RuntimeToAppMessage>) => {
      const message = event.data;

      if (!this.activeRun || message.executionId !== this.activeRun.executionId) {
        return;
      }

      if (message.type === "execution-error") {
        this.clearTimeout();
        this.activeRun = null;
        this.handlers?.onError({
          executionId: message.executionId,
          blockId: message.blockId,
          error: message.error,
        });
        return;
      }

      this.handlers?.onMessage(message);

      if (message.type === "execution-complete") {
        this.completeActiveBlock(message.blockId);
      }
    };

    this.worker.onerror = () => {
      if (!this.activeRun) {
        return;
      }

      const { executionId, targetBlockId } = this.activeRun;
      this.clearTimeout();
      this.forceRestart();
      this.handlers?.onError({
        executionId,
        blockId: targetBlockId,
        error: {
          kind: "bridge",
          name: "WorkerBridgeError",
          message: "Worker runtime bridge failed",
        },
      });
    };
  }

  private forceRestart() {
    this.clearTimeout();
    this.activeRun = null;
    this.worker?.terminate();
    this.worker = null;
  }

  private postMessage(message: AppToRuntimeMessage) {
    this.worker?.postMessage(message);
  }

  private startTimeout() {
    this.clearTimeout();

    if (!this.activeRun) {
      return;
    }

    this.timeoutId = setTimeout(() => {
      if (!this.activeRun) {
        return;
      }

      const { executionId, targetBlockId, timeoutMs } = this.activeRun;
      this.forceRestart();
      this.handlers?.onError({
        executionId,
        blockId: targetBlockId,
        error: {
          kind: "timeout",
          name: "TimeoutError",
          message: `Execution timed out after ${timeoutMs}ms`,
        },
      });
    }, this.activeRun.timeoutMs);
  }

  private clearTimeout() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const notebookWorkerBridge = new NotebookWorkerBridge();

export function toRuntimeExecutionRequest(
  request: ExecutionRequest,
  blocks: RuntimeExecutionRequest["blocks"],
  timeoutMs?: number,
): RuntimeExecutionRequest | null {
  if (request.command === "reset" || request.command === "stop") {
    return null;
  }

  return {
    ...request,
    blocks,
    timeoutMs,
  };
}
