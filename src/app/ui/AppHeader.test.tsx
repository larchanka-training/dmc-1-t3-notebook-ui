import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { AppHeader } from "@/app/ui/AppHeader";

describe("AppHeader", () => {
  it("shows notebooks nav when authenticated", () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        userEmail: "user@example.com",
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter([{ path: "/", element: <AppHeader /> }], {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("link", { name: "Notebooks" })).toHaveAttribute(
      "href",
      "/notebooks",
    );
  });
});
