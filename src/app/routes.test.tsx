import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";

const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

describe("routes", () => {
  it("/login renders LoginPage without app header", () => {
    renderAt("/login");
    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("/notebooks renders NotebooksListPage inside AppLayout", () => {
    renderAt("/notebooks");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /notebooks/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("/notebooks/:notebookId renders editor with notebook id", () => {
    renderAt("/notebooks/xyz-789");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText(/xyz-789/)).toBeInTheDocument();
  });

  it("unknown path redirects to /notebooks", () => {
    renderAt("/totally/unknown/path");
    expect(
      screen.getByRole("heading", { name: /notebooks/i, level: 1 })
    ).toBeInTheDocument();
  });
});
