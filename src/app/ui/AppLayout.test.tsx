import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

    render(<RouterProvider router={router} />);
    expect(screen.getByText("JS Notebook")).toBeInTheDocument();
    expect(screen.getByText("Child route")).toBeInTheDocument();
  });
});
