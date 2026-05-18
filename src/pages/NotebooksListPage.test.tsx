import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotebooksListPage } from "./NotebooksListPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <NotebooksListPage />
    </MemoryRouter>
  );

describe("NotebooksListPage", () => {
  it("renders page heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /notebooks/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders Create notebook action", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /create notebook/i })
    ).toBeInTheDocument();
  });

  it("renders empty state when no notebooks exist", () => {
    renderPage();
    expect(screen.getByText(/no notebooks yet/i)).toBeInTheDocument();
  });
});
