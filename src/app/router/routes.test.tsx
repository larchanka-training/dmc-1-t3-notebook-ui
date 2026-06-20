import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { routes } from "@/app/router/routes";
import { testUser } from "@test/authFixtures";
import { renderWithProviders } from "@test/renderWithProviders";

describe("routes", () => {
  it("redirects unauthenticated users from /notebooks to /login", async () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: false,
        user: null,
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(routes, {
      initialEntries: ["/notebooks"],
    });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders notebooks for authenticated users", async () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        user: testUser(),
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(routes, { initialEntries: ["/notebooks"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("button", { name: "Create notebook" }),
    ).toBeInTheDocument();
  });

  it("redirects unknown paths to login when unauthenticated", async () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/unknown"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
