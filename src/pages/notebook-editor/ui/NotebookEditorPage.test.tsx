import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotebookEditorPage } from "@/pages/notebook-editor";

describe("NotebookEditorPage", () => {
  it("renders the notebook editor shell with route notebook id", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: ["/notebooks/nb_jsnb_50"] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("region", { name: "Notebook blocks" })).toBeInTheDocument();
    expect(screen.getByText(/Notebook nb_jsnb_50/)).toBeInTheDocument();
  });
});
