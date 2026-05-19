import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
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

  it("navigates to a new local notebook editor when creating a notebook", async () => {
    const user = userEvent.setup();

    function LocationProbe() {
      const location = useLocation();
      return <span data-testid="location">{location.pathname}</span>;
    }

    render(
      <MemoryRouter initialEntries={["/notebooks"]}>
        <Routes>
          <Route
            path="/notebooks"
            element={
              <>
                <NotebooksListPage />
                <LocationProbe />
              </>
            }
          />
          <Route
            path="/notebooks/:notebookId"
            element={<LocationProbe />}
          />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /create notebook/i }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      /^\/notebooks\/local-/
    );
  });
});
