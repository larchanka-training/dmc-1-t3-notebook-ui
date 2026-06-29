import { useCallback, useMemo } from "react";
import { getLocalAiRuntimeConfig } from "@/shared/config";
import { useLocalAiRuntime } from "./localRuntime";
import type { NotebookLocalAiSurfaceStatus } from "./types";

type UseNotebookLocalAiStatusParams = {
  notebookId: string | null;
  serverNotebookId: string | null;
};

export function useNotebookLocalAiStatus({
  notebookId,
  serverNotebookId,
}: UseNotebookLocalAiStatusParams) {
  void notebookId;
  void serverNotebookId;
  const localRuntime = useLocalAiRuntime();
  const localRuntimeConfig = useMemo(() => getLocalAiRuntimeConfig(), []);
  const localModeEnabled = localRuntimeConfig.enabled;

  const surfaceStatus: NotebookLocalAiSurfaceStatus = !localModeEnabled
    ? "disabled"
    : localRuntime.status === "loading-model"
      ? "preparing"
      : localRuntime.status;

  const statusLabel =
    surfaceStatus === "disabled"
      ? "Disabled"
      : surfaceStatus === "unsupported"
        ? "Unsupported"
        : surfaceStatus === "preparing"
          ? "Preparing"
          : surfaceStatus === "ready"
            ? localRuntime.provider.model
            : surfaceStatus === "failed"
              ? "Failed"
              : null;

  const summary =
    surfaceStatus === "disabled"
      ? null
      : surfaceStatus === "unsupported"
        ? (localRuntime.error?.message ??
          "Local WebLLM is not supported in this browser.")
        : surfaceStatus === "preparing"
          ? (localRuntime.progressLabel ?? "Preparing WebLLM local mode...")
          : surfaceStatus === "ready"
            ? null
            : surfaceStatus === "failed"
              ? (localRuntime.error?.message ?? "Local WebLLM could not be prepared.")
              : null;

  const canPrepareLocal =
    localModeEnabled &&
    (localRuntime.status === "idle" || localRuntime.status === "failed");
  const canResetLocal =
    localModeEnabled &&
    (localRuntime.status === "ready" || localRuntime.status === "failed");

  const onPrepareLocalMode = useCallback(async () => {
    await localRuntime.initialize();
  }, [localRuntime]);

  const onResetLocalMode = useCallback(async () => {
    await localRuntime.reset();
  }, [localRuntime]);

  return {
    localModeEnabled,
    surfaceStatus,
    statusLabel,
    summary,
    canPrepareLocal,
    canResetLocal,
    onPrepareLocalMode,
    onResetLocalMode,
  };
}
