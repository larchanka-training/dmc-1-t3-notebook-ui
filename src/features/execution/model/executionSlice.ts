import type { StateCreator } from "zustand";
import {
  initialExecutionState,
  type ExecutionOutput,
  type ExecutionRequest,
  type ExecutionSlice,
  type NormalizedExecutionError,
} from "./types";

export const createExecutionSlice: StateCreator<
  ExecutionSlice,
  [],
  [],
  ExecutionSlice
> = (set, get) => {
  const isActiveExecution = (
    activeExecutionId: string | null,
    incomingExecutionId: string,
  ) => activeExecutionId === incomingExecutionId;

  const appendOutput = (
    existingOutputs: Record<string, ExecutionOutput[]>,
    blockId: string,
    output: ExecutionOutput,
  ) => ({
    ...existingOutputs,
    [blockId]: [...(existingOutputs[blockId] ?? []), output],
  });

  const removeRunningBlockId = (runningBlockIds: string[], blockId: string) =>
    runningBlockIds.filter((runningBlockId) => runningBlockId !== blockId);

  const omitExecutionOrder = (
    executionOrderByBlockId: Record<string, number>,
    blockId: string,
  ) => {
    const next = { ...executionOrderByBlockId };
    delete next[blockId];
    return next;
  };

  const getStatusForError = (error: NormalizedExecutionError) => {
    switch (error.kind) {
      case "timeout":
        return "timeout" as const;
      case "canceled":
        return "canceled" as const;
      default:
        return "error" as const;
    }
  };

  return {
    execution: initialExecutionState,
    startExecution: (request: ExecutionRequest) => {
      set((state) => {
        const preserveExecutionOrder = request.command !== "run-all";

        return {
          execution: {
            ...initialExecutionState,
            executionOrderByBlockId: preserveExecutionOrder
              ? state.execution.executionOrderByBlockId
              : {},
            nextExecutionOrder: preserveExecutionOrder
              ? state.execution.nextExecutionOrder
              : 1,
            status: request.command === "stop" ? "stopping" : "running",
            activeExecutionId: request.executionId,
            activeCommand: request.command,
            targetBlockId: "targetBlockId" in request ? request.targetBlockId : null,
          },
        };
      });
    },
    markBlockRunning: (executionId, blockId) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        const runningBlockIds = state.execution.runningBlockIds.includes(blockId)
          ? state.execution.runningBlockIds
          : [...state.execution.runningBlockIds, blockId];

        return {
          execution: {
            ...state.execution,
            runningBlockIds,
          },
        };
      });
    },
    clearBlockOutputsForRun: (executionId, blockId) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        return {
          execution: {
            ...state.execution,
            executionOrderByBlockId: omitExecutionOrder(
              state.execution.executionOrderByBlockId,
              blockId,
            ),
            outputs: {
              ...state.execution.outputs,
              [blockId]: [],
            },
          },
        };
      });
    },
    appendBlockOutput: (executionId, blockId, output) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        return {
          execution: {
            ...state.execution,
            outputs: appendOutput(state.execution.outputs, blockId, output),
          },
        };
      });
    },
    recordExecutionError: (executionId, error, blockId) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        const outputs = blockId
          ? appendOutput(state.execution.outputs, blockId, {
              type: "error",
              payload: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            })
          : state.execution.outputs;

        return {
          execution: {
            ...state.execution,
            status: getStatusForError(error),
            runningBlockIds: blockId
              ? removeRunningBlockId(state.execution.runningBlockIds, blockId)
              : [],
            executionOrderByBlockId:
              error.kind === "timeout" ||
              error.kind === "canceled" ||
              error.kind === "bridge"
                ? {}
                : state.execution.executionOrderByBlockId,
            nextExecutionOrder:
              error.kind === "timeout" ||
              error.kind === "canceled" ||
              error.kind === "bridge"
                ? 1
                : state.execution.nextExecutionOrder,
            outputs,
            error,
          },
        };
      });
    },
    completeBlockExecution: (executionId, blockId) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        const runningBlockIds = removeRunningBlockId(
          state.execution.runningBlockIds,
          blockId,
        );

        return {
          execution: {
            ...state.execution,
            status: runningBlockIds.length === 0 ? "idle" : state.execution.status,
            runningBlockIds,
            executionOrderByBlockId: {
              ...state.execution.executionOrderByBlockId,
              [blockId]: state.execution.nextExecutionOrder,
            },
            nextExecutionOrder: state.execution.nextExecutionOrder + 1,
          },
        };
      });
    },
    resetExecutionState: () => {
      set({
        execution: initialExecutionState,
      });
    },
    markExecutionStopping: (executionId, targetBlockId) => {
      set((state) => {
        if (!isActiveExecution(state.execution.activeExecutionId, executionId)) {
          return state;
        }

        return {
          execution: {
            ...state.execution,
            status: "stopping" as const,
          },
        };
      });

      // Schedule canceled error after the current microtask so the UI can
      // react to 'stopping' status first. This stays in the slice because it
      // only calls other slice actions — no runtime side effects.
      const { activeExecutionId } = get().execution;
      if (activeExecutionId === executionId) {
        setTimeout(() => {
          get().recordExecutionError(
            executionId,
            {
              kind: "canceled",
              name: "CanceledError",
              message: "Execution was canceled",
            },
            targetBlockId ?? undefined,
          );
        }, 0);
      }
    },
    disposeExecutionSession: () => {
      // Worker bridge disposal is the caller's responsibility.
      // This action resets slice state only.
      set({
        execution: initialExecutionState,
      });
    },
  };
};
