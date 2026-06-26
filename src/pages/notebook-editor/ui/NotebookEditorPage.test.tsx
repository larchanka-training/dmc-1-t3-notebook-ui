import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../../../../test/msw/server";
import {
  LocalAiRuntimeController,
  setLocalAiRuntimeControllerForTests,
} from "@/features/ai/model";
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
  beforeEach(() => {
    vi.unstubAllEnvs();
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: false,
          rolloutPolicy: "disabled",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

    expect(screen.getByText("Submitting via bedrock · scope: this")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    ).toBeDisabled();

    deferred.resolve(
      HttpResponse.json({
        requestId: "air_success_2",
        status: "success",
        code: "const total = orders.reduce((sum, order) => sum + order.total, 0);",
        provider: { name: "bedrock", model: "deepseek.v3.2" },
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
          provider: { name: "bedrock", model: "deepseek.v3.2" },
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

    expect(await screen.findByText("Ready via bedrock · scope: this")).toBeInTheDocument();
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
          provider: { name: "bedrock", model: "deepseek.v3.2" },
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

    expect(await screen.findByText("Ready via bedrock · scope: this")).toBeInTheDocument();
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
      "Policy via bedrock: This action accepts only code-generation or code-revision requests.",
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

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Validation via bedrock: AI generation requires a synced notebook available on the server.",
    );
    expect(requestSpy).not.toHaveBeenCalled();
    expect(within(introAiAction).getByText("Local WebLLM")).toBeInTheDocument();
    expect(
      within(introAiAction).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    ).toBeDisabled();
    expect(
      within(introAiAction).getByText(
        "Backend AI requires a synced notebook. Prepare WebLLM to generate locally for this draft.",
      ),
    ).toBeInTheDocument();
  });

  it("prepares WebLLM and runs explicit local generation with provider labeling", async () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "public-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: async () => ({
            chat: {
              completions: {
                create: async () => ({
                  choices: [
                    {
                      message: {
                        content:
                          "```js\nconst localTotal = orders.reduce((sum, order) => sum + order.total, 0);\n```",
                      },
                    },
                  ],
                }),
              },
            },
          }),
        }),
      }),
    );

    const user = userEvent.setup();
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

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    expect(within(introAiAction).getByText("Local WebLLM")).toBeInTheDocument();
    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Prepare WebLLM local mode for blk_intro",
      }),
    );

    expect(
      await within(screen.getByLabelText("AI action for blk_intro")).findByText(
        "Local mode ready via webllm:test-model.",
      ),
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    expect(await screen.findByText("Ready via webllm:test-model · scope: this")).toBeInTheDocument();
    expect(screen.getByLabelText("Generated code preview for blk_intro")).toHaveTextContent(
      "const localTotal = orders.reduce((sum, order) => sum + order.total, 0);",
    );
    expect(screen.getByText("Generated draft · webllm:test-model")).toBeInTheDocument();
  });

  it("surfaces unsupported WebLLM runtime as a frontend-local local-mode failure", async () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "public-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({
          supported: false,
          error: {
            code: "unsupported_environment",
            message: "No compatible adapter.",
            retryable: false,
          },
        }),
      }),
    );

    const user = userEvent.setup();
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

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Prepare WebLLM local mode for blk_intro",
      }),
    );

    expect(await within(introAiAction).findByText("No compatible adapter.")).toBeInTheDocument();
    expect(
      within(introAiAction).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    ).toBeDisabled();
    expect(
      screen.queryByLabelText("Generated code preview for blk_intro"),
    ).not.toBeInTheDocument();
  });

  it("surfaces WebLLM bootstrap failure without mutating notebook content", async () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "public-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => {
          throw new Error("Model bootstrap crashed.");
        },
      }),
    );

    const user = userEvent.setup();
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

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    const markdownInput = screen.getByLabelText("Markdown source for blk_intro");
    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Prepare WebLLM local mode for blk_intro",
      }),
    );

    expect(await within(introAiAction).findByText("Model bootstrap crashed.")).toBeInTheDocument();
    expect(markdownInput).toHaveValue(
      "## Explore order totals\nUse Markdown notes to explain the intent before running JavaScript examples.",
    );
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
    expect(
      screen.queryByLabelText("Generated code preview for blk_intro"),
    ).not.toBeInTheDocument();
  });

  it("allows explicit local generation for an unsynced local notebook draft", async () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");
    const requestSpy = vi.fn();
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "public-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: async () => ({
            chat: {
              completions: {
                create: async () => ({
                  choices: [
                    {
                      message: {
                        content: "const draftResult = 'local-only';",
                      },
                    },
                  ],
                }),
              },
            },
          }),
        }),
      }),
    );

    server.use(
      http.post(AI_GENERATE_URL, async ({ request }) => {
        requestSpy(await request.json());
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: ["/notebooks/local-draft-1"] },
    );

    render(<RouterProvider router={router} />);

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    expect(
      within(introAiAction).getByText(
        "Backend AI requires a synced notebook. Prepare WebLLM to generate locally for this draft.",
      ),
    ).toBeInTheDocument();

    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Prepare WebLLM local mode for blk_intro",
      }),
    );

    expect(
      await within(introAiAction).findByText(
        "Backend AI requires a synced notebook. Local mode ready via webllm:test-model.",
      ),
    ).toBeInTheDocument();

    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    expect(requestSpy).not.toHaveBeenCalled();
    expect(await screen.findByText("Ready via webllm:test-model · scope: this")).toBeInTheDocument();
    expect(screen.getByLabelText("Generated code preview for blk_intro")).toHaveTextContent(
      "const draftResult = 'local-only';",
    );
  });

  it("offers local retry after a retryable backend provider failure", async () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");
    setLocalAiRuntimeControllerForTests(
      new LocalAiRuntimeController({
        getConfig: () => ({
          enabled: true,
          rolloutPolicy: "public-opt-in",
          modelId: "test-model",
          bootstrapTimeoutMs: 50,
          moduleSpecifier: "@mlc-ai/web-llm",
        }),
        checkCapability: async () => ({ supported: true }),
        loadModule: async () => ({
          CreateMLCEngine: async () => ({
            chat: {
              completions: {
                create: async () => ({
                  choices: [
                    {
                      message: {
                        content: "const fallbackTotal = orders.length;",
                      },
                    },
                  ],
                }),
              },
            },
          }),
        }),
      }),
    );

    server.use(
      http.post(AI_GENERATE_URL, () =>
        HttpResponse.json(
          {
            requestId: "air_error_timeout",
            status: "error",
            errorCode: "AI_PROVIDER_TIMEOUT",
            message: "The AI provider timed out.",
            retryable: true,
          },
          { status: 504 },
        ),
      ),
    );

    const user = userEvent.setup();
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

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Prepare WebLLM local mode for blk_intro",
      }),
    );
    expect(
      await within(screen.getByLabelText("AI action for blk_intro")).findByText(
        "Local mode ready via webllm:test-model.",
      ),
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code from blk_intro",
      }),
    );

    expect(await within(screen.getByLabelText("AI action for blk_intro")).findByRole("alert")).toHaveTextContent(
      "Provider via bedrock: The AI provider timed out.",
    );
    expect(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    ).toHaveTextContent("Retry locally with WebLLM");

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    expect(await screen.findByText("Ready via webllm:test-model · scope: this")).toBeInTheDocument();
    expect(screen.getByLabelText("Generated code preview for blk_intro")).toHaveTextContent(
      "const fallbackTotal = orders.length;",
    );
  });
});
