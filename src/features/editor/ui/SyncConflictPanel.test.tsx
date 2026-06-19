import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SyncConflictPanel } from "./SyncConflictPanel";

const renderPanel = () => {
  const handlers = {
    onReview: vi.fn(),
    onReplace: vi.fn(),
    onKeepLocal: vi.fn(),
    onRetry: vi.fn(),
  };
  render(
    <SyncConflictPanel
      baseRevision={2}
      serverRevision={5}
      onReview={handlers.onReview}
      onReplace={handlers.onReplace}
      onKeepLocal={handlers.onKeepLocal}
      onRetry={handlers.onRetry}
    />,
  );
  return handlers;
};

describe("SyncConflictPanel", () => {
  it("announces the conflict with local and server revisions", () => {
    renderPanel();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Automatic merge was not performed");
    expect(alert).toHaveTextContent("2");
    expect(alert).toHaveTextContent("5");
  });

  it("renders the four resolution actions and wires their handlers", async () => {
    const user = userEvent.setup();
    const handlers = renderPanel();

    await user.click(screen.getByRole("button", { name: /review server version/i }));
    await user.click(
      screen.getByRole("button", { name: /replace local with server/i }),
    );
    await user.click(screen.getByRole("button", { name: /keep local for later/i }));
    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(handlers.onReview).toHaveBeenCalledOnce();
    expect(handlers.onReplace).toHaveBeenCalledOnce();
    expect(handlers.onKeepLocal).toHaveBeenCalledOnce();
    expect(handlers.onRetry).toHaveBeenCalledOnce();
  });
});
