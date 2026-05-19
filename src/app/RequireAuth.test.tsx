import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useAppStore } from "../store";
import { RequireAuth } from "./RequireAuth";

const makeRouter = (entry: string) =>
  createMemoryRouter(
    [
      { path: "/login", element: <div>login screen</div> },
      {
        element: <RequireAuth />,
        children: [{ path: "/secret", element: <div>secret content</div> }]
      }
    ],
    { initialEntries: [entry] }
  );

describe("RequireAuth", () => {
  it("redirects to /login when unauthenticated", () => {
    render(<RouterProvider router={makeRouter("/secret")} />);
    expect(screen.getByText("login screen")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders the child route when authenticated", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    render(<RouterProvider router={makeRouter("/secret")} />);
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});
