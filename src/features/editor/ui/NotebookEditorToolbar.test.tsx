import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { NotebookSyncStatus } from "@/entities/notebook";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";
import type { BlockActions } from "../model/types";

const noopActions: BlockActions = {
  addBlockBefore: vi.fn(),
  addBlockAfter: vi.fn(),
  deleteBlockById: vi.fn(),
  moveBlockById: vi.fn(),
  runAll: vi.fn(),
  runBlock: vi.fn(),
  runFromHere: vi.fn(),
  stopExecution: vi.fn(),
  updateText: vi.fn(),
  updateCode: vi.fn(),
  applyGeneratedCode: vi.fn(),
};

const renderToolbar = (
  overrides: Partial<{
    syncStatus: NotebookSyncStatus;
    onSync: () => void;
    statusSupplement: ReactNode;
  }> = {},
) => {
  const onSync = overrides.onSync ?? vi.fn();
  render(
    <MemoryRouter>
      <NotebookEditorToolbar
        lastBlockId=""
        actions={noopActions}
        executionMessage="Execution idle"
        executionStatus="idle"
        canStartExecution
        canStopExecution={false}
        syncStatus={overrides.syncStatus ?? "unsynced"}
        onSync={onSync}
        statusSupplement={overrides.statusSupplement}
      />
    </MemoryRouter>,
  );
  return { onSync };
};

describe("NotebookEditorToolbar sync", () => {
  it("renders a Sync button that triggers onSync", async () => {
    const user = userEvent.setup();
    const { onSync } = renderToolbar();

    const button = screen.getByRole("button", { name: /sync/i });
    await user.click(button);

    expect(onSync).toHaveBeenCalledOnce();
  });

  it("shows the sync status label", () => {
    renderToolbar({ syncStatus: "conflict" });
    expect(screen.getByTestId("sync-status")).toHaveTextContent("Sync status");
    expect(screen.getByTestId("sync-status")).toHaveTextContent("Sync conflict");
  });

  it("disables the Sync button while syncing", () => {
    renderToolbar({ syncStatus: "syncing" });
    expect(screen.getByRole("button", { name: /sync/i })).toBeDisabled();
  });

  it("renders a separate runtime status surface", () => {
    renderToolbar();

    expect(screen.getByLabelText("Runtime status")).toHaveTextContent("Runtime status");
    expect(screen.getByLabelText("Runtime status")).toHaveTextContent("Execution idle");
  });

  it("renders an optional supplemental top-bar status surface", () => {
    renderToolbar({
      statusSupplement: <div aria-label="Local AI status">Local AI Ready</div>,
    });

    expect(screen.getByLabelText("Local AI status")).toHaveTextContent(
      "Local AI Ready",
    );
  });
});
