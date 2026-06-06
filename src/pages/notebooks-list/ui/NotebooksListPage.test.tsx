import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { testUser } from "@test/authFixtures";
import { NotebooksListPage } from "@/pages/notebooks-list";

describe("NotebooksListPage", () => {
  it("creates a notebook and navigates to the editor route", async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        user: testUser(),
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(
      [
        { path: "/notebooks", element: <NotebooksListPage /> },
        {
          path: "/notebooks/:notebookId",
          element: <div>Editor</div>,
        },
      ],
      { initialEntries: ["/notebooks"] },
    );

    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole("button", { name: "Create notebook" }));

    expect(await screen.findByText("Editor")).toBeInTheDocument();
    expect(useAppStore.getState().notebookList.items).toHaveLength(1);
  });

  it("opens an existing notebook from the list", async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      auth: {
        isAuthenticated: true,
        user: testUser(),
        authenticatedAt: null,
        status: "idle",
        error: null,
      },
      notebookList: {
        items: [
          {
            id: "nb_existing",
            title: "My notebook",
            updatedAt: "2026-05-18T10:00:00.000Z",
          },
        ],
        status: "idle",
        error: null,
      },
    });

    const router = createMemoryRouter(
      [
        { path: "/notebooks", element: <NotebooksListPage /> },
        {
          path: "/notebooks/:notebookId",
          element: <div>Editor nb_existing</div>,
        },
      ],
      { initialEntries: ["/notebooks"] },
    );

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("link", { name: /My notebook/i }));

    expect(await screen.findByText("Editor nb_existing")).toBeInTheDocument();
  });
});
