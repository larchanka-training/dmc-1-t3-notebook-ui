import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { LoginPage } from "@/pages/login";

describe("LoginPage", () => {
  it("redirects to /notebooks when already authenticated", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/notebooks", element: <div>Notebooks list</div> },
      ],
      { initialEntries: ["/login"] },
    );

    render(<RouterProvider router={router} />);
    expect(screen.getByText("Notebooks list")).toBeInTheDocument();
  });

  it("verifies mock OTP and navigates to notebooks", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/notebooks", element: <div>Notebooks list</div> },
      ],
      { initialEntries: ["/login"] },
    );

    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Send code" }));
    await user.type(screen.getByLabelText("One-time code"), "1234");
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    expect(await screen.findByText("Notebooks list")).toBeInTheDocument();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
  });
});
