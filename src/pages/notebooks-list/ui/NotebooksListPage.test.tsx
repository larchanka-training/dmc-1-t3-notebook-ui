import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/app/model";
import {
  createLocalNotebookRepository,
  DEFAULT_SYNC_META,
  sampleNotebook,
} from "@/entities/notebook";
import { testUser } from "@test/authFixtures";
import { NotebooksListPage } from "@/pages/notebooks-list";

function authenticate() {
  useAppStore.setState({
    auth: {
      isAuthenticated: true,
      user: testUser(),
      authenticatedAt: null,
      status: "idle",
      error: null,
    },
  });
}

describe("NotebooksListPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a notebook and navigates to the editor route", async () => {
    const user = userEvent.setup();
    authenticate();

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

  it("opens an existing local notebook from the merged list", async () => {
    const user = userEvent.setup();
    authenticate();

    // Seed the default local repository so the merged list loads it on mount.
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "nb_existing", title: "My notebook" },
      DEFAULT_SYNC_META,
    );

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

    await user.click(await screen.findByRole("button", { name: /^My notebook/i }));

    expect(await screen.findByText("Editor nb_existing")).toBeInTheDocument();
  });

  it("deletes an existing local notebook from the list page", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    authenticate();

    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "nb_delete", title: "Delete me" },
      DEFAULT_SYNC_META,
    );

    const router = createMemoryRouter(
      [{ path: "/notebooks", element: <NotebooksListPage /> }],
      {
        initialEntries: ["/notebooks"],
      },
    );

    render(<RouterProvider router={router} />);

    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: "Delete Delete me" }));

    expect(
      screen.queryByRole("button", { name: /Delete me/i }),
    ).not.toBeInTheDocument();
    expect(await repository.load("nb_delete")).toBeUndefined();
  });
});
