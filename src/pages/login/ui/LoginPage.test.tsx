import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { testUser } from "@test/authFixtures";
import { setMockSessionAuthenticated } from "@test/msw/handlers/auth";
import { renderWithProviders } from "@test/renderWithProviders";
import { LoginPage } from "@/pages/login";

describe("LoginPage", () => {
  it("redirects to /notebooks when already authenticated", () => {
    setMockSessionAuthenticated(true, "user@example.com");
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        user: testUser(),
        authenticatedAt: "2026-05-14T10:00:00Z",
        status: "idle",
        error: null,
      },
    });
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/notebooks", element: <div>Notebooks list</div> },
      ],
      { initialEntries: ["/login"] },
    );

    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByText("Notebooks list")).toBeInTheDocument();
  });

  it("verifies OTP via API and navigates to notebooks", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/notebooks", element: <div>Notebooks list</div> },
      ],
      { initialEntries: ["/login"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    await waitFor(() => {
      expect(screen.getByLabelText("One-time code")).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText("One-time code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    expect(await screen.findByText("Notebooks list")).toBeInTheDocument();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
    expect(useAppStore.getState().auth.user?.email).toBe("test@example.com");
  });
});
