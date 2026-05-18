import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NotebookEditorPage } from "./NotebookEditorPage";

describe("NotebookEditorPage", () => {
  it("renders a vertical notebook block list with text and code blocks", () => {
    render(<NotebookEditorPage />);

    expect(
      screen.getByRole("region", { name: "Notebook blocks" })
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Markdown text block")).toHaveLength(2);
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
  });

  it("shows run actions and output placeholders for code blocks", () => {
    render(<NotebookEditorPage />);

    expect(screen.getAllByRole("button", { name: /^Run blk_/ })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /^Run block blk_/ })).toHaveLength(2);
    expect(screen.getAllByLabelText(/^Output area for blk_/)).toHaveLength(2);
  });

  it("keeps block actions keyboard reachable", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    const addButton = screen.getByRole("button", {
      name: "Add block near blk_intro"
    });
    addButton.focus();

    expect(addButton).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Move blk_intro up" })).toHaveFocus();
  });
});
