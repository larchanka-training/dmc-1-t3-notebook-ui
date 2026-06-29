import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../../../../test/msw/server";
import {
  LocalAiRuntimeController,
  setLocalAiRuntimeControllerForTests,
} from "@/features/ai";
import {
  createCodeBlock,
  createLocalNotebookRepository,
  DEFAULT_SYNC_META,
  sampleNotebook,
} from "@/entities/notebook";
import { NotebookEditorPage } from "@/pages/notebook-editor";
import {
  setMockServerNotebook,
  setMockServerNotebooks,
} from "@test/msw/handlers/notebooks";
import { renderWithProviders } from "@test/renderWithProviders";

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
  beforeEach(async () => {
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

    const repository = createLocalNotebookRepository();
    await repository.save(
      {
        ...sampleNotebook,
        id: SERVER_NOTEBOOK_ID,
        title: "Untitled",
      },
      {
        ...DEFAULT_SYNC_META,
        serverId: SERVER_NOTEBOOK_ID,
        baseRevision: sampleNotebook.revision,
        status: "synced",
      },
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
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

    renderWithProviders(<RouterProvider router={router} />);

    expect(
      screen.getByRole("complementary", { name: "Notebook navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notebook header" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Notebook top bar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notebook blocks" })).toBeInTheDocument();
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Local AI");
    expect(screen.getByRole("heading", { name: "Untitled" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create notebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All notebooks" })).toBeInTheDocument();
  });

  it("collapses the notebook sidebar into an icon rail", async () => {
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Collapse notebook sidebar" }));

    expect(
      screen.getByRole("button", { name: "Expand notebook sidebar" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("New notebook")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create notebook" })).toBeInTheDocument();
  });

  it("deletes the active synced notebook and redirects to the notebooks list", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "local-synced-1", title: "Synced notebook" },
      {
        ...DEFAULT_SYNC_META,
        serverId: SERVER_NOTEBOOK_ID,
        baseRevision: 7,
        status: "synced",
      },
    );
    setMockServerNotebooks([
      {
        id: SERVER_NOTEBOOK_ID,
        title: "Synced notebook",
        tags: [],
        revision: 7,
        created_at: "2026-06-18T10:00:00.000Z",
        updated_at: "2026-06-18T11:00:00.000Z",
      },
    ]);
    setMockServerNotebook({
      id: SERVER_NOTEBOOK_ID,
      title: "Synced notebook",
      tags: [],
      blocks: sampleNotebook.blocks,
      revision: 7,
      created_at: "2026-06-18T10:00:00.000Z",
      updated_at: "2026-06-18T11:00:00.000Z",
      last_synced_at: "2026-06-18T11:00:00.000Z",
    });

    const router = createMemoryRouter(
      [
        {
          path: "/notebooks",
          element: <div>Notebook list route</div>,
        },
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: ["/notebooks/local-synced-1"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    await userEvent
      .setup()
      .click(
        await screen.findByRole("button", { name: "Delete notebook from editor" }),
      );

    expect(await screen.findByText("Notebook list route")).toBeInTheDocument();
    expect(await repository.load("local-synced-1")).toBeUndefined();
  });

  it("renders idle AI actions for text blocks only", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/notebooks/:notebookId",
          element: <NotebookEditorPage />,
        },
      ],
      { initialEntries: [`/notebooks/${SERVER_NOTEBOOK_ID}`] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("button", { name: "Generate code from blk_intro" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Generate code from blk_observation" }),
    ).not.toBeInTheDocument();
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(
      await screen.findByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(screen.getByText("Generating...")).toBeInTheDocument();
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
    await waitFor(() =>
      expect(screen.queryByText("Generating...")).not.toBeInTheDocument(),
    );
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

    renderWithProviders(<RouterProvider router={router} />);

    const markdownInput = (await screen.findByLabelText(
      "Markdown source for blk_intro",
    )) as unknown as {
      value: string;
    };
    const originalValue = markdownInput.value;

    await user.click(
      await screen.findByRole("button", { name: "Generate code from blk_intro" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Generating...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/AI_CONTEXT_TRUNCATED:/)).toBeInTheDocument();
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
    const repository = createLocalNotebookRepository();
    await repository.save(
      {
        ...sampleNotebook,
        id: SERVER_NOTEBOOK_ID,
        title: "Reusable empty block notebook",
        blocks: sampleNotebook.blocks.map((block) =>
          block.id === "blk_prepare_data"
            ? createCodeBlock("blk_prepare_data", "")
            : block,
        ),
      },
      {
        ...DEFAULT_SYNC_META,
        serverId: SERVER_NOTEBOOK_ID,
        baseRevision: sampleNotebook.revision,
        status: "synced",
      },
    );

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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(
      await screen.findByRole("button", { name: "Generate code from blk_intro" }),
    );

    await waitFor(() =>
      expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2),
    );
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
    const reusedBlockArticle = screen
      .getByRole("button", { name: "Run blk_prepare_data" })
      .closest("article");
    expect(reusedBlockArticle).not.toBeNull();
    expect(within(reusedBlockArticle!).getByRole("textbox")).toHaveTextContent(
      "const average = total / orders.length;",
    );
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

    renderWithProviders(<RouterProvider router={router} />);

    const markdownInput = await screen.findByLabelText("Markdown source for blk_intro");

    await user.click(
      await screen.findByRole("button", { name: "Generate code from blk_intro" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Policy via bedrock: This action accepts only code-generation or code-revision requests.",
    );
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(
      screen.getByRole("button", { name: "Generate code from blk_intro" }),
    );

    const introAiAction = screen.getByLabelText("AI action for blk_intro");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Validation via bedrock: AI generation requires a synced notebook available on the server.",
    );
    expect(requestSpy).not.toHaveBeenCalled();
    expect(
      within(introAiAction).queryByRole("button", { name: "Prepare WebLLM" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Local AI");
    expect(screen.getByRole("button", { name: "Prepare WebLLM" })).toBeInTheDocument();
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Prepare WebLLM" }));

    await screen.findByText("test-model");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Local AI");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("test-model");
    expect(
      screen.getByRole("button", { name: "Reset WebLLM local mode" }),
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    await waitFor(() =>
      expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3),
    );
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3);
    expect(
      screen
        .getAllByRole("textbox")
        .some((textbox) =>
          textbox.textContent?.includes(
            "const localTotal = orders.reduce((sum, order) => sum + order.total, 0);",
          ),
        ),
    ).toBe(true);
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Prepare WebLLM" }));

    await screen.findByText("No compatible adapter.");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Unsupported");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent(
      "No compatible adapter.",
    );
    expect(
      screen.queryByRole("button", {
        name: "Prepare WebLLM",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Generating...")).not.toBeInTheDocument();
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

    renderWithProviders(<RouterProvider router={router} />);

    const markdownInput = await screen.findByLabelText("Markdown source for blk_intro");
    await user.click(screen.getByRole("button", { name: "Prepare WebLLM" }));

    await screen.findByText("Model bootstrap crashed.");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Failed");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent(
      "Model bootstrap crashed.",
    );
    expect(markdownInput).toHaveValue(
      "## Explore order totals\nUse Markdown notes to explain the intent before running JavaScript examples.",
    );
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
    expect(screen.queryByText("Generating...")).not.toBeInTheDocument();
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

    const repository = createLocalNotebookRepository();
    await repository.save(
      {
        ...sampleNotebook,
        id: "local-draft-1",
        title: "Untitled",
      },
      DEFAULT_SYNC_META,
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

    renderWithProviders(<RouterProvider router={router} />);

    const introAiAction = await screen.findByLabelText("AI action for blk_intro");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("Local AI");

    await user.click(screen.getByRole("button", { name: "Prepare WebLLM" }));

    await screen.findByText("test-model");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("test-model");

    await user.click(
      within(introAiAction).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    expect(requestSpy).not.toHaveBeenCalled();
    const localInsertedBlockArticle = (
      await screen.findByRole("button", { name: "Run blk_new_code_1" })
    ).closest("article");
    expect(localInsertedBlockArticle).not.toBeNull();
    expect(within(localInsertedBlockArticle!).getByRole("textbox")).toHaveTextContent(
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

    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Prepare WebLLM" }));
    await screen.findByText("test-model");
    expect(screen.getByLabelText("Local AI status")).toHaveTextContent("test-model");

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code from blk_intro",
      }),
    );

    expect(
      await within(screen.getByLabelText("AI action for blk_intro")).findByRole(
        "alert",
      ),
    ).toHaveTextContent("Provider via bedrock: The AI provider timed out.");
    expect(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    ).toHaveAttribute("title", "Retry locally with WebLLM");

    await user.click(
      within(screen.getByLabelText("AI action for blk_intro")).getByRole("button", {
        name: "Generate code locally from blk_intro",
      }),
    );

    const fallbackInsertedBlockArticle = (
      await screen.findByRole("button", { name: "Run blk_new_code_1" })
    ).closest("article");
    expect(fallbackInsertedBlockArticle).not.toBeNull();
    expect(
      within(fallbackInsertedBlockArticle!).getByRole("textbox"),
    ).toHaveTextContent("const fallbackTotal = orders.length;");
  });
});
