import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { Notebook } from "@/entities/notebook";
import type { NotebookSyncStatus } from "@/entities/notebook";
import { NotebookEditorToolbar } from "./NotebookEditorToolbar";
import type { BlockActions } from "../model/types";

const notebook: Notebook = {
  id: "nb_1",
  title: "Toolbar notebook",
  revision: 1,
  createdAt: "2026-06-18T10:00:00.000Z",
  updatedAt: "2026-06-18T10:00:00.000Z",
  blocks: [],
};

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
  }> = {},
) => {
  const onSync = overrides.onSync ?? vi.fn();
  render(
    <MemoryRouter>
      <NotebookEditorToolbar
        notebook={notebook}
        lastBlockId=""
        actions={noopActions}
        executionMessage="Execution idle"
        executionStatus="idle"
        canStartExecution
        canStopExecution={false}
        syncStatus={overrides.syncStatus ?? "unsynced"}
        onSync={onSync}
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
    expect(screen.getByTestId("sync-status")).toHaveTextContent("Sync conflict");
  });

  it("disables the Sync button while syncing", () => {
    renderToolbar({ syncStatus: "syncing" });
    expect(screen.getByRole("button", { name: /sync/i })).toBeDisabled();
  });
});
