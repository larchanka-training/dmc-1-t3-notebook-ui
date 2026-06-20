import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@test/renderWithProviders";
import { AppLayout } from "@/app/ui/AppLayout";

describe("AppLayout", () => {
  it("renders header and outlet content", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <AppLayout />,
          children: [{ index: true, element: <div>Child route</div> }],
        },
      ],
      { initialEntries: ["/"] },
    );

    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByText("JS Notebook")).toBeInTheDocument();
    expect(screen.getByText("Child route")).toBeInTheDocument();
  });
});
