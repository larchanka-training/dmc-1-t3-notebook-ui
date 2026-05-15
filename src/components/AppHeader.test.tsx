import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppHeader } from "./AppHeader";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <AppHeader />
    </MemoryRouter>
  );

describe("AppHeader", () => {
  it("renders logo mark and product name", () => {
    renderHeader();
    expect(screen.getByRole("img", { name: /js notebook logo/i })).toBeInTheDocument();
    expect(screen.getByText(/js notebook/i)).toBeInTheDocument();
  });

  it("renders navigation links to notebooks list", () => {
    renderHeader();
    const link = screen.getByRole("link", { name: /notebooks/i });
    expect(link).toHaveAttribute("href", "/notebooks");
  });

  it("uses semantic <header> landmark", () => {
    renderHeader();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
