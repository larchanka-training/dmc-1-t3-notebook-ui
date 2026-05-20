import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { RequireAuth } from "@/app/router/RequireAuth";

describe("RequireAuth", () => {
  it("redirects when not authenticated", async () => {
    useAppStore.setState({
      auth: {
        isAuthenticated: false,
        userEmail: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <RequireAuth />,
          children: [{ index: true, element: <div>Protected</div> }],
        },
        { path: "/login", element: <div>Login</div> },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Login")).toBeInTheDocument();
  });
});
