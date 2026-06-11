import { describe, expect, it, vi, afterEach } from "vitest";
import type { AppToRuntimeMessage, RuntimeToAppMessage } from "../model/types";
import { NotebookWorkerBridge } from "./notebookWorkerBridge";

class FakeWorker {
  messages: AppToRuntimeMessage[] = [];
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessage: ((event: MessageEvent<RuntimeToAppMessage>) => void) | null = null;
  terminated = false;

  postMessage(message: AppToRuntimeMessage) {
    this.messages.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: RuntimeToAppMessage) {
    this.onmessage?.({ data: message } as MessageEvent<RuntimeToAppMessage>);
  }
}

describe("NotebookWorkerBridge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends RESET_SESSION before RUN_BLOCKS for run-all", async () => {
    const workers: FakeWorker[] = [];
    const bridge = new NotebookWorkerBridge(() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    });

    await bridge.run(
      {
        command: "run-all",
        executionId: "exec_1",
        targetBlockId: "blk_1",
        blocks: [{ blockId: "blk_1", source: "1 + 1;" }],
      },
      {
        onMessage: vi.fn(),
        onError: vi.fn(),
      },
    );

    expect(workers[0].messages).toEqual([
      { type: "RESET_SESSION", executionId: "exec_1" },
      {
        type: "RUN_BLOCKS",
        executionId: "exec_1",
        blocks: [{ blockId: "blk_1", source: "1 + 1;" }],
      },
    ]);
  });

  it("ignores stale worker messages after a new run replaces the active execution", async () => {
    const workers: FakeWorker[] = [];
    const onMessage = vi.fn();
    const onError = vi.fn();
    const bridge = new NotebookWorkerBridge(() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    });

    await bridge.run(
      {
        command: "run-current",
        executionId: "exec_1",
        targetBlockId: "blk_1",
        blocks: [{ blockId: "blk_1", source: "1 + 1;" }],
      },
      { onMessage, onError },
    );

    await bridge.run(
      {
        command: "run-current",
        executionId: "exec_2",
        targetBlockId: "blk_2",
        blocks: [{ blockId: "blk_2", source: "2 + 2;" }],
      },
      { onMessage, onError },
    );

    workers[0].emit({
      type: "execution-output",
      executionId: "exec_1",
      blockId: "blk_1",
      output: { type: "text", payload: "stale" },
    });
    workers[1].emit({
      type: "execution-output",
      executionId: "exec_2",
      blockId: "blk_2",
      output: { type: "text", payload: "fresh" },
    });

    expect(workers[0].terminated).toBe(true);
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({
      type: "execution-output",
      executionId: "exec_2",
      blockId: "blk_2",
      output: { type: "text", payload: "fresh" },
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("terminates the worker and emits a timeout error when execution exceeds the deadline", async () => {
    vi.useFakeTimers();

    const workers: FakeWorker[] = [];
    const onError = vi.fn();
    const bridge = new NotebookWorkerBridge(() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    });

    await bridge.run(
      {
        command: "run-current",
        executionId: "exec_1",
        targetBlockId: "blk_1",
        blocks: [{ blockId: "blk_1", source: "while (true) {}" }],
        timeoutMs: 10,
      },
      {
        onMessage: vi.fn(),
        onError,
      },
    );

    vi.advanceTimersByTime(10);

    expect(workers[0].terminated).toBe(true);
    expect(onError).toHaveBeenCalledWith({
      executionId: "exec_1",
      blockId: "blk_1",
      error: {
        kind: "timeout",
        name: "TimeoutError",
        message: "Execution timed out after 10ms",
      },
    });
  });
});
