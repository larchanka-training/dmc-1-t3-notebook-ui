import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTextBlock } from "@/entities/notebook";
import type { TextBlock } from "@/entities/notebook";
import { useBlockAiAction } from "./useBlockAiAction";

const generateMock = vi.fn();

vi.mock("../api", () => ({
  backendAiGenerationProvider: {
    generate: (...args: unknown[]) => generateMock(...args),
  },
  localAiGenerationProvider: {
    generate: vi.fn(),
  },
  AiGenerationError: class AiGenerationError extends Error {},
}));

describe("useBlockAiAction", () => {
  beforeEach(() => {
    generateMock.mockReset();
  });

  it("uses sync.serverId for synced local working copies", async () => {
    generateMock.mockResolvedValue({
      requestId: "air_success_server_id",
      code: "const total = 1;",
      provider: {
        id: "bedrock",
        model: "deepseek.v3.2",
        label: "bedrock:deepseek.v3.2",
        path: "backend",
      },
      warnings: [],
    });

    const sourceBlock = createTextBlock(
      "blk_source",
      "Write JavaScript code.",
    ) as TextBlock;
    const onInsertCode = vi.fn();
    const { result } = renderHook(() =>
      useBlockAiAction({
        notebookId: "local-mqo4tkbm",
        serverNotebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        notebookTitle: "Synced local working copy",
        blocks: [sourceBlock],
        block: sourceBlock,
        onInsertCode,
      }),
    );

    await act(async () => {
      await result.current.onGenerate();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        sourceBlockId: "blk_source",
      }),
    );
    expect(onInsertCode).toHaveBeenCalledWith("blk_source", "const total = 1;");
    expect(result.current.provider).toEqual({
      id: "bedrock",
      model: "deepseek.v3.2",
      label: "bedrock:deepseek.v3.2",
      path: "backend",
    });
  });

  it("still allows direct UUID notebook routes without sync.serverId", async () => {
    generateMock.mockResolvedValue({
      requestId: "air_success_direct_uuid",
      code: "const answer = 42;",
      provider: {
        id: "bedrock",
        model: "deepseek.v3.2",
        label: "bedrock:deepseek.v3.2",
        path: "backend",
      },
      warnings: [],
    });

    const sourceBlock = createTextBlock(
      "blk_source",
      "Write JavaScript code.",
    ) as TextBlock;
    const { result } = renderHook(() =>
      useBlockAiAction({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        serverNotebookId: null,
        notebookTitle: "Server-backed route",
        blocks: [sourceBlock],
        block: sourceBlock,
      }),
    );

    await act(async () => {
      await result.current.onGenerate();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
      }),
    );
  });

  it("keeps the same insertion flow when a local provider is injected", async () => {
    const sourceBlock = createTextBlock(
      "blk_source",
      "Write JavaScript code.",
    ) as TextBlock;
    const localProvider = {
      generate: vi.fn().mockResolvedValue({
        requestId: "air_success_local",
        code: "const total = 1;",
        provider: {
          id: "webllm",
          model: "test-model",
          label: "webllm:test-model",
          path: "local",
        },
        warnings: [],
      }),
    };
    const onInsertCode = vi.fn();
    const { result } = renderHook(() =>
      useBlockAiAction({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        serverNotebookId: null,
        notebookTitle: "Server-backed route",
        blocks: [sourceBlock],
        block: sourceBlock,
        onInsertCode,
        provider: localProvider,
      }),
    );

    await act(async () => {
      await result.current.onGenerate();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(localProvider.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        sourceBlockId: "blk_source",
      }),
    );
    expect(onInsertCode).toHaveBeenCalledWith("blk_source", "const total = 1;");
    expect(result.current.provider).toEqual({
      id: "webllm",
      model: "test-model",
      label: "webllm:test-model",
      path: "local",
    });
  });
});
