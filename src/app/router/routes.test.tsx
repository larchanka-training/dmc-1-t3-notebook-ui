import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { routes } from "@/app/router/routes";

describe("routes", () => {
  it("redirects unauthenticated users from /notebooks to /login", async () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: false,
        userEmail: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(routes, {
      initialEntries: ["/notebooks"],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
