import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAppStore } from "../store";
import { AppHeader } from "./AppHeader";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <AppHeader />
    </MemoryRouter>
  );

describe("AppHeader", () => {
  it("always shows the brand", () => {
    renderHeader();
    expect(screen.getByText("JS Notebook")).toBeInTheDocument();
  });

  it("hides the Notebooks nav when unauthenticated", () => {
    renderHeader();
    expect(
      screen.queryByRole("link", { name: /notebooks/i })
    ).not.toBeInTheDocument();
  });

  it("shows the Notebooks nav when authenticated", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    renderHeader();
    expect(
      screen.getByRole("link", { name: /notebooks/i })
    ).toBeInTheDocument();
  });
});
