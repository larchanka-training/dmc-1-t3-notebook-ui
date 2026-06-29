import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HelpPage } from "@/pages/help";
import { renderWithProviders } from "@test/renderWithProviders";

describe("HelpPage", () => {
  it("renders the help content with the notebook sidebar shell", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/help",
          element: <HelpPage />,
        },
      ],
      { initialEntries: ["/help"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How Notebook Is Organized" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps the help entry reachable when the sidebar is collapsed", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: "/help",
          element: <HelpPage />,
        },
      ],
      { initialEntries: ["/help"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Collapse notebook sidebar" }));

    expect(
      screen.getByRole("button", { name: "Expand notebook sidebar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
  });
});
