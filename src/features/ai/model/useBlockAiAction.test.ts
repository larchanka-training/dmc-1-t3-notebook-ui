import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTextBlock } from "@/entities/notebook";
import type { TextBlock } from "@/entities/notebook";
import { useBlockAiAction } from "./useBlockAiAction";

const generateCodeBlockMock = vi.fn();

vi.mock("../api/aiApi", () => ({
  generateCodeBlock: (...args: unknown[]) => generateCodeBlockMock(...args),
}));

describe("useBlockAiAction", () => {
  beforeEach(() => {
    generateCodeBlockMock.mockReset();
  });

  it("uses sync.serverId for synced local working copies", async () => {
    generateCodeBlockMock.mockResolvedValue({
      requestId: "air_success_server_id",
      status: "success",
      code: "const total = 1;",
      provider: { name: "bedrock", model: "deepseek.v3.2" },
      validation: {
        extractionApplied: false,
        syntaxOk: true,
        repairAttempts: 0,
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
    expect(generateCodeBlockMock).toHaveBeenCalledWith(
      expect.objectContaining({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
        sourceBlockId: "blk_source",
      }),
    );
    expect(onInsertCode).toHaveBeenCalledWith("blk_source", "const total = 1;");
  });

  it("still allows direct UUID notebook routes without sync.serverId", async () => {
    generateCodeBlockMock.mockResolvedValue({
      requestId: "air_success_direct_uuid",
      status: "success",
      code: "const answer = 42;",
      provider: { name: "bedrock", model: "deepseek.v3.2" },
      validation: {
        extractionApplied: false,
        syntaxOk: true,
        repairAttempts: 0,
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
    expect(generateCodeBlockMock).toHaveBeenCalledWith(
      expect.objectContaining({
        notebookId: "2d58d140-5532-4ac3-8457-3114a9f4b9f2",
      }),
    );
  });
});
