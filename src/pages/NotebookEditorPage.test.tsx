import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotebookEditorPage } from "./NotebookEditorPage";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/notebooks/:notebookId"
          element={<NotebookEditorPage />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("NotebookEditorPage (stub)", () => {
  it("reflects the :notebookId route param", () => {
    renderAt("/notebooks/abc-123");
    expect(screen.getByText(/abc-123/)).toBeInTheDocument();
  });

  it("renders a not-implemented placeholder (editor UI is a separate task)", () => {
    renderAt("/notebooks/abc-123");
    expect(screen.getByText(/not implemented yet/i)).toBeInTheDocument();
  });
});
