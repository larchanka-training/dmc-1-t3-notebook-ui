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
      name: "Add text block after blk_intro"
    });
    addButton.focus();

    expect(addButton).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Add code block after blk_intro" })
    ).toHaveFocus();
  });

  it("adds text and code blocks below the selected block", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    await user.click(
      screen.getByRole("button", { name: "Add text block after blk_intro" })
    );
    await user.click(
      screen.getByRole("button", { name: "Add code block after blk_intro" })
    );

    expect(screen.getAllByLabelText("Markdown text block")).toHaveLength(3);
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3);
    expect(screen.getByLabelText("Markdown source for blk_new_text_1")).toHaveValue(
      "New Markdown note"
    );
    expect(screen.getByLabelText("JavaScript source for blk_new_code_2")).toHaveValue(
      "console.log('New block');"
    );
    expect(screen.getByLabelText("Output area for blk_new_code_2")).toBeInTheDocument();
  });

  it("moves blocks up and down in the rendered order", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    await user.click(screen.getByRole("button", { name: "Move blk_prepare_data up" }));

    const firstBlockActions = screen.getAllByRole("article")[0];
    expect(firstBlockActions).toHaveClass("notebook-block-code");

    await user.click(screen.getByRole("button", { name: "Move blk_prepare_data down" }));

    const restoredFirstBlock = screen.getAllByRole("article")[0];
    expect(restoredFirstBlock).toHaveClass("notebook-block-text");
  });

  it("deletes blocks and removes their output placeholders", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    await user.click(screen.getByRole("button", { name: "Delete blk_prepare_data" }));

    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(1);
    expect(
      screen.queryByLabelText("Output area for blk_prepare_data")
    ).not.toBeInTheDocument();
  });

  it("edits block content locally without backend calls", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    const markdownInput = screen.getByLabelText("Markdown source for blk_intro");
    await user.clear(markdownInput);
    await user.type(markdownInput, "Updated local note");

    expect(markdownInput).toHaveValue("Updated local note");
  });

  it("updates output placeholder text on run without executing JavaScript", async () => {
    const user = userEvent.setup();

    render(<NotebookEditorPage />);

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));

    expect(
      screen.getByText(
        "Run requested. Execution is intentionally out of scope for this task."
      )
    ).toBeInTheDocument();
  });
});
