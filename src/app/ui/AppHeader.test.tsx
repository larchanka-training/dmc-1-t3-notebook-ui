import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { testUser } from "@test/authFixtures";
import { renderWithProviders } from "@test/renderWithProviders";
import { AppHeader } from "@/app/ui/AppHeader";

const authenticatedAuth = {
  isAuthenticated: true,
  user: testUser(),
  authenticatedAt: null,
  status: "idle" as const,
  error: null,
};

describe("AppHeader", () => {
  it("shows notebooks nav and log out when authenticated", () => {
    useAppStore.setState({ auth: authenticatedAuth });

    const router = createMemoryRouter([{ path: "/", element: <AppHeader /> }], {
      initialEntries: ["/"],
    });
    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole("link", { name: "Notebooks" })).toHaveAttribute(
      "href",
      "/notebooks",
    );
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("does not show log out when unauthenticated", () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: false,
        user: null,
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter([{ path: "/", element: <AppHeader /> }], {
      initialEntries: ["/"],
    });
    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  it("logs out and clears auth state", async () => {
    const user = userEvent.setup();
    useAppStore.setState({ auth: authenticatedAuth });

    const router = createMemoryRouter(
      [
        { path: "/", element: <AppHeader /> },
        { path: "/login", element: <div>Login page</div> },
      ],
      { initialEntries: ["/"] },
    );
    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
  });
});
