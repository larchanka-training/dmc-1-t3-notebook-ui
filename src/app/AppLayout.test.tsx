import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/notebooks" element={<div>list-page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("AppLayout", () => {
  it("renders header on routes inside the layout", () => {
    renderAt("/notebooks");
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the matched child route inside <main>", () => {
    renderAt("/notebooks");
    const main = screen.getByRole("main");
    expect(main).toHaveTextContent("list-page");
  });
});
