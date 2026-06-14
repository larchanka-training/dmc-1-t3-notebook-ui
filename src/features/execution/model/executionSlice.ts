import type { StateCreator } from "zustand";
import { notebookWorkerBridge } from "../lib/notebookWorkerBridge";
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
      set({
        execution: {
          ...initialExecutionState,
          status: request.command === "stop" ? "stopping" : "running",
          activeExecutionId: request.executionId,
          activeCommand: request.command,
          targetBlockId: "targetBlockId" in request ? request.targetBlockId : null,
        },
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
          },
        };
      });
    },
    resetExecutionState: () => {
      set({
        execution: initialExecutionState,
      });
    },
    stopExecution: () => {
      const { activeExecutionId, status, targetBlockId } = get().execution;

      if (!activeExecutionId || status !== "running") {
        return;
      }

      set((state) => ({
        execution: {
          ...state.execution,
          status: "stopping",
        },
      }));

      notebookWorkerBridge.stop(activeExecutionId);
      setTimeout(() => {
        get().recordExecutionError(
          activeExecutionId,
          {
            kind: "canceled",
            name: "CanceledError",
            message: "Execution was canceled",
          },
          targetBlockId ?? undefined,
        );
      }, 0);
    },
    disposeExecutionSession: () => {
      notebookWorkerBridge.dispose();
      set({
        execution: initialExecutionState,
      });
    },
  };
};
