import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { server } from "../../../../test/msw/server";
import { NotebookEditorPage } from "@/pages/notebook-editor";

const TEST_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";
const AI_GENERATE_URL = `${TEST_API_BASE}/ai/code-blocks/generate`;
const SERVER_NOTEBOOK_ID = "2d58d140-5532-4ac3-8457-3114a9f4b9f2";

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe("NotebookEditorPage", () => {
  it("renders the notebook editor shell with route notebook id", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("region", { name: "Notebook blocks" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: `Notebook ${SERVER_NOTEBOOK_ID}` }),
    ).toBeInTheDocument();
  });

  it("renders idle AI actions for text blocks only", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate code from blk_observation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Generate code from blk_prepare_data" }),
    ).not.toBeInTheDocument();
  });

  it("shows submitting state while the AI request is in flight", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<Response>();

    server.use(http.post(AI_GENERATE_URL, () => deferred.promise));

    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(screen.getByText("Submitting · scope: this")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    ).toBeDisabled();

    deferred.resolve(
      HttpResponse.json({
        requestId: "air_success_2",
        status: "success",
        code: "const total = orders.reduce((sum, order) => sum + order.total, 0);",
        provider: { name: "bedrock", model: "anthropic.claude-3-haiku" },
        validation: {
          extractionApplied: true,
          syntaxOk: true,
          repairAttempts: 0,
        },
      }),
    );
    expect(
      await screen.findByLabelText("Generated code preview for blk_intro"),
    ).toBeInTheDocument();
  });

  it("inserts a new code block after the source text block when the next block is not empty", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(AI_GENERATE_URL, async ({ request }) => {
        const body = (await request.json()) as {
          notebookId: string;
          sourceBlockId: string;
          prompt: string;
          context: {
            sourceText: string;
            scope: string;
            relevantBlocks: Array<{ blockId: string }>;
          };
        };

        expect(body.notebookId).toBe(SERVER_NOTEBOOK_ID);
        expect(body.sourceBlockId).toBe("blk_intro");
        expect(body.prompt).toContain("Explore order totals");
        expect(body.context.sourceText).toContain("Explore order totals");
        expect(body.context.scope).toBe("this");
        expect(body.context.relevantBlocks).toMatchObject([{ blockId: "blk_intro" }]);

        return HttpResponse.json({
          requestId: "air_success_3",
          status: "success",
          code: "function summarizeOrders(orders) { return orders.map((order) => order.total); }",
          provider: { name: "bedrock", model: "anthropic.claude-3-haiku" },
          validation: {
            extractionApplied: true,
            syntaxOk: true,
            repairAttempts: 0,
          },
          warnings: [
            {
              code: "AI_CONTEXT_TRUNCATED",
              message:
                "Some low-priority context blocks were omitted to fit the request budget.",
            },
          ],
        });
      }),
    );

    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    const markdownInput = screen.getByLabelText(
      "Markdown source for blk_intro",
    ) as unknown as {
      value: string;
    };
    const originalValue = markdownInput.value;

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(await screen.findByText("Ready · scope: this")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Generated code preview for blk_intro"),
    ).toHaveTextContent("function summarizeOrders");
    expect(screen.getByText(/AI_CONTEXT_TRUNCATED:/)).toBeInTheDocument();
    expect(screen.getByText("Request: air_success_3")).toBeInTheDocument();
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3);
    const insertedBlockArticle = screen
      .getByRole("button", { name: "Run blk_new_code_1" })
      .closest("article");
    expect(insertedBlockArticle).not.toBeNull();
    expect(within(insertedBlockArticle!).getByRole("textbox")).toHaveTextContent(
      "function summarizeOrders(orders) { return orders.map((order) => order.total); }",
    );
    expect(screen.getByLabelText("Markdown source for blk_intro")).toHaveValue(
      originalValue,
    );
  });

  it("reuses the next empty code block for inserted AI code", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(AI_GENERATE_URL, () =>
        HttpResponse.json({
          requestId: "air_success_4",
          status: "success",
          code: "const average = total / orders.length;",
          provider: { name: "bedrock", model: "anthropic.claude-3-haiku" },
          validation: {
            extractionApplied: true,
            syntaxOk: true,
            repairAttempts: 0,
          },
        }),
      ),
    );

    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    await user.click(
      screen.getByRole("button", { name: "Add code block below blk_observation" }),
    );

    const insertedBlockArticle = screen
      .getByRole("button", { name: "Run blk_new_code_1" })
      .closest("article");
    expect(insertedBlockArticle).not.toBeNull();
    const insertedCodeInput = within(insertedBlockArticle!).getByRole("textbox");
    await user.click(insertedCodeInput);
    await user.keyboard("{Control>}a{/Control}{Backspace}");

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_observation" }),
    );

    expect(await screen.findByText("Ready · scope: this")).toBeInTheDocument();
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3);
    expect(screen.getByText("Request: air_success_4")).toBeInTheDocument();
  });

  it("shows normalized backend error state without mutating the source text block", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(AI_GENERATE_URL, () =>
        HttpResponse.json(
          {
            requestId: "air_error_1",
            status: "error",
            errorCode: "AI_PROMPT_REJECTED",
            message:
              "This action accepts only code-generation or code-revision requests.",
            retryable: false,
          },
          { status: 400 },
        ),
      ),
    );

    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    render(<RouterProvider router={router} />);

    const markdownInput = screen.getByLabelText("Markdown source for blk_intro");

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Policy: This action accepts only code-generation or code-revision requests.",
    );
    expect(screen.getByText("Request: air_error_1")).toBeInTheDocument();
    expect(markdownInput).toHaveValue(
      "## Explore order totals\nUse Markdown notes to explain the intent before running JavaScript examples.",
    );
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
  });

  it("blocks AI requests for local notebooks before hitting the backend", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.fn();

    server.use(
      http.post(AI_GENERATE_URL, async ({ request }) => {
        requestSpy(await request.json());
        return HttpResponse.json({}, { status: 500 });
      }),
    );

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

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Validation: AI generation requires a synced notebook available on the server.",
    );
    expect(requestSpy).not.toHaveBeenCalled();
  });
});
