import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotebookEditorPage } from "./NotebookEditorPage";

describe("NotebookEditorPage route entry", () => {
  it("renders the notebook editor implementation from the editor module", () => {
    render(<NotebookEditorPage />);

    expect(
      screen.getByRole("region", { name: "Notebook blocks" })
    ).toBeInTheDocument();
    expect(screen.getByText("Notebook editor template")).toBeInTheDocument();
  });
});
