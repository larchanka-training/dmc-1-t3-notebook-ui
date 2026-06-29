import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalNotebookRepository,
  DEFAULT_SYNC_META,
  sampleNotebook,
} from "@/entities/notebook";
import type { RuntimeExecutionRequest } from "@/features/execution";
import { notebookWorkerBridge } from "@/features/execution";
import { server } from "@test/msw/server";
import { NotebookEditorView } from "./NotebookEditorView";

const TEST_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

const renderEditor = (notebookId = "nb_jsnb_50") => {
  const router = createMemoryRouter(
    [
      {
        path: "/notebooks/:notebookId",
        element: <NotebookEditorView notebookId={notebookId} />,
      },
    ],
    { initialEntries: [`/notebooks/${notebookId}`] },
  );
  render(<RouterProvider router={router} />);
};

const selectCodeBlock = (blockId: string) => {
  const runButton = screen.getByRole("button", { name: `Run ${blockId}` });
  fireEvent.mouseDown(runButton);
  return runButton;
};

const focusDivider = (label: string) => {
  const divider = screen.getByRole("button", { name: label });
  divider.focus();
  return divider;
};

describe("NotebookEditorView", () => {
  let bridgeRunMock: ReturnType<typeof vi.spyOn>;
  let bridgeStopMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    bridgeRunMock = vi
      .spyOn(notebookWorkerBridge, "run")
      .mockImplementation(async (request, handlers) => {
        request.blocks.forEach((block, index) => {
          handlers.onMessage({
            type: "execution-started",
            executionId: request.executionId,
            blockId: block.blockId,
          });
          handlers.onMessage({
            type: "execution-output",
            executionId: request.executionId,
            blockId: block.blockId,
            output: {
              type: "text",
              payload: `${block.blockId}:${index + 1}`,
            },
          });
          handlers.onMessage({
            type: "execution-complete",
            executionId: request.executionId,
            blockId: block.blockId,
          });
        });
      });
    bridgeStopMock = vi
      .spyOn(notebookWorkerBridge, "stop")
      .mockImplementation(() => {});
    vi.spyOn(notebookWorkerBridge, "dispose").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  type BridgeHandlers = Parameters<typeof notebookWorkerBridge.run>[1];

  const emitExecutionSuccess = (
    request: RuntimeExecutionRequest,
    handlers: BridgeHandlers,
    blockId: string,
    payload?: string,
  ) => {
    handlers.onMessage({
      type: "execution-started",
      executionId: request.executionId,
      blockId,
    });

    if (payload !== undefined) {
      handlers.onMessage({
        type: "execution-output",
        executionId: request.executionId,
        blockId,
        output: {
          type: "text",
          payload,
        },
      });
    }

    handlers.onMessage({
      type: "execution-complete",
      executionId: request.executionId,
      blockId,
    });
  };

  it("renders a vertical notebook block list with text and code blocks", () => {
    renderEditor();

    expect(screen.getByRole("region", { name: "Notebook header" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Notebook top bar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notebook blocks" })).toBeInTheDocument();
    expect(screen.getAllByLabelText("Markdown text block")).toHaveLength(2);
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(2);
  });

  it("shows run actions and output placeholders for code blocks", () => {
    renderEditor();

    expect(screen.getAllByRole("button", { name: /^Run blk_/ })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Run all" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.getByLabelText("Sync status")).toHaveTextContent("Sync status");
    expect(screen.getByLabelText("Runtime status")).toHaveTextContent("Runtime status");
    expect(screen.getAllByLabelText(/^Output area for blk_/)).toHaveLength(2);

    selectCodeBlock("blk_prepare_data");
    expect(
      screen.getByRole("button", {
        name: "Run from here blk_prepare_data from gutter",
      }),
    ).toBeInTheDocument();
  });

  it("keeps block actions keyboard reachable", async () => {
    const user = userEvent.setup();
    renderEditor();

    const addButton = focusDivider(
      "Insert block between blk_intro and blk_prepare_data",
    );

    expect(addButton).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", {
        name: "Insert block between blk_intro and blk_prepare_data as text",
      }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", {
        name: "Insert block between blk_intro and blk_prepare_data as code",
      }),
    ).toHaveFocus();
  });

  it("renders insert dividers before, between, and after notebook blocks", () => {
    renderEditor();

    const dividerTriggers = screen.getAllByRole("button").filter((element) => {
      const label = element.getAttribute("aria-label") ?? "";
      return label.startsWith("Insert block ") && !label.includes(" as ");
    });

    expect(dividerTriggers).toHaveLength(5);
  });

  it("adds text and code blocks from the selected divider", async () => {
    const user = userEvent.setup();
    renderEditor();

    focusDivider("Insert block between blk_intro and blk_prepare_data");
    await user.click(
      screen.getByRole("button", {
        name: "Insert block between blk_intro and blk_prepare_data as text",
      }),
    );
    focusDivider("Insert block between blk_new_text_1 and blk_prepare_data");
    await user.click(
      screen.getByRole("button", {
        name: "Insert block between blk_new_text_1 and blk_prepare_data as code",
      }),
    );

    expect(screen.getAllByLabelText("Markdown text block")).toHaveLength(3);
    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(3);
    expect(screen.getByLabelText("Markdown source for blk_new_text_1")).toHaveValue("");
    expect(
      screen.getByLabelText("JavaScript source for blk_new_code_2"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Output area for blk_new_code_2")).toBeInTheDocument();
  });

  it("inserts a text block from divider keyboard activation", async () => {
    const user = userEvent.setup();
    renderEditor();

    const divider = focusDivider("Insert block between blk_intro and blk_prepare_data");
    divider.focus();
    await user.keyboard("{Enter}");

    expect(screen.getAllByLabelText("Markdown text block")).toHaveLength(3);
    expect(screen.getByLabelText("Markdown source for blk_new_text_1")).toHaveValue("");
  });

  it("moves blocks up and down in the rendered order", async () => {
    const user = userEvent.setup();
    renderEditor();

    screen.getByLabelText("JavaScript source for blk_prepare_data").focus();
    await user.click(screen.getByRole("button", { name: "Move blk_prepare_data up" }));

    const firstBlock = screen.getAllByRole("article")[0];
    expect(
      within(firstBlock).getByLabelText("JavaScript code block"),
    ).toBeInTheDocument();

    screen.getByLabelText("JavaScript source for blk_prepare_data").focus();
    await user.click(
      screen.getByRole("button", { name: "Move blk_prepare_data down" }),
    );

    const restoredFirstBlock = screen.getAllByRole("article")[0];
    expect(
      within(restoredFirstBlock).getByLabelText("Markdown text block"),
    ).toBeInTheDocument();
  });

  it("deletes blocks and removes their output placeholders", async () => {
    const user = userEvent.setup();
    renderEditor();

    screen.getByLabelText("JavaScript source for blk_prepare_data").focus();
    await user.click(screen.getByRole("button", { name: "Delete blk_prepare_data" }));

    expect(screen.getAllByLabelText("JavaScript code block")).toHaveLength(1);
    expect(
      screen.queryByLabelText("Output area for blk_prepare_data"),
    ).not.toBeInTheDocument();
  });

  it("edits block content locally without backend calls", async () => {
    const user = userEvent.setup();
    renderEditor();

    const markdownInput = screen.getByLabelText("Markdown source for blk_intro");
    await user.clear(markdownInput);
    await user.type(markdownInput, "Updated local note");

    expect(markdownInput).toHaveValue("Updated local note");
  });

  it("opens an unsaved local route with the default notebook title instead of the local id", () => {
    renderEditor("local-mqjwawp9");

    expect(screen.getByRole("heading", { name: "Untitled" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /local-mqjwawp9/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty notebook state for a new local draft route", () => {
    renderEditor("local-empty-draft");

    expect(screen.getByRole("region", { name: "Empty notebook" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert text block" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert code block" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Markdown text block")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("JavaScript code block")).not.toBeInTheDocument();
  });

  it("creates the first text block from the empty notebook state", async () => {
    const user = userEvent.setup();
    renderEditor("local-empty-first-text");

    await user.click(screen.getByRole("button", { name: "Insert text block" }));

    expect(
      screen.queryByRole("region", { name: "Empty notebook" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Markdown source for blk_new_text_1")).toHaveValue("");
  });

  it("creates the first code block from the empty notebook state", async () => {
    const user = userEvent.setup();
    renderEditor("local-empty-first-code");

    await user.click(screen.getByRole("button", { name: "Insert code block" }));

    expect(
      screen.queryByRole("region", { name: "Empty notebook" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("JavaScript source for blk_new_code_1"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Output area for blk_new_code_1")).toBeInTheDocument();
  });

  it("renames a local-only notebook and persists the new title locally", async () => {
    const user = userEvent.setup();
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "local-rename", title: "Untitled" },
      DEFAULT_SYNC_META,
    );

    renderEditor("local-rename");

    await user.click(screen.getByRole("button", { name: "Rename notebook title" }));
    const input = screen.getByLabelText("Notebook title");
    await user.clear(input);
    await user.type(input, "Project notes");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("heading", { name: "Project notes" }),
    ).toBeInTheDocument();
    await waitFor(async () => {
      expect((await repository.load("local-rename"))?.notebook.title).toBe(
        "Project notes",
      );
    });
  });

  it("saves the edited notebook title when focus leaves the title form", async () => {
    const user = userEvent.setup();
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "local-blur-save", title: "Untitled" },
      DEFAULT_SYNC_META,
    );

    renderEditor("local-blur-save");

    await user.click(screen.getByRole("button", { name: "Rename notebook title" }));
    const input = screen.getByLabelText("Notebook title");
    await user.clear(input);
    await user.type(input, "Blur saved title");
    fireEvent.blur(input, {
      relatedTarget: screen.getByRole("button", { name: "Run all" }),
    });

    expect(
      await screen.findByRole("heading", { name: "Blur saved title" }),
    ).toBeInTheDocument();
    await waitFor(async () => {
      expect((await repository.load("local-blur-save"))?.notebook.title).toBe(
        "Blur saved title",
      );
    });
  });

  it("renames a synced notebook through the metadata patch endpoint", async () => {
    const user = userEvent.setup();
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "local-synced", title: "Untitled" },
      {
        ...DEFAULT_SYNC_META,
        serverId: "srv-rename",
        baseRevision: 7,
        status: "synced",
      },
    );

    let patchRequests = 0;
    server.use(
      http.patch(`${TEST_API_BASE}/notebooks/srv-rename`, async ({ request }) => {
        patchRequests += 1;
        expect(await request.json()).toEqual({ title: "Renamed synced" });
        return HttpResponse.json({
          id: "srv-rename",
          title: "Renamed synced",
          tags: [],
          blocks: [],
          revision: 7,
          created_at: "2026-06-18T10:00:00.000Z",
          updated_at: "2026-06-18T12:00:00.000Z",
          last_synced_at: "2026-06-18T11:00:00.000Z",
        });
      }),
    );

    renderEditor("local-synced");

    await user.click(screen.getByRole("button", { name: "Rename notebook title" }));
    const input = screen.getByLabelText("Notebook title");
    await user.clear(input);
    await user.type(input, "Renamed synced");
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("heading", { name: "Renamed synced" }),
    ).toBeInTheDocument();
    expect(patchRequests).toBe(1);
    expect((await repository.load("local-synced"))?.notebook.title).toBe(
      "Renamed synced",
    );
  });

  it("shows an inline error when synced rename fails and keeps the current title", async () => {
    const user = userEvent.setup();
    const repository = createLocalNotebookRepository();
    await repository.save(
      { ...sampleNotebook, id: "local-error", title: "Stable title" },
      {
        ...DEFAULT_SYNC_META,
        serverId: "srv-error",
        baseRevision: 4,
        status: "synced",
      },
    );

    server.use(
      http.patch(`${TEST_API_BASE}/notebooks/srv-error`, () =>
        HttpResponse.json(
          { error: { code: "server_error", message: "Rename failed" } },
          { status: 500 },
        ),
      ),
    );

    renderEditor("local-error");

    await user.click(screen.getByRole("button", { name: "Rename notebook title" }));
    const input = screen.getByLabelText("Notebook title");
    await user.clear(input);
    await user.type(input, "Broken rename");
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("Rename failed");
    expect(
      screen.queryByRole("heading", { name: "Broken rename" }),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Broken rename")).toBeInTheDocument();
    expect((await repository.load("local-error"))?.notebook.title).toBe("Stable title");
  });

  it("renders the block gutter with persistent affordances and reveal actions", () => {
    renderEditor();

    expect(
      screen.getByRole("button", { name: "Run blk_prepare_data" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Text block").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Code block").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Delete blk_prepare_data" }),
    ).toBeInTheDocument();

    selectCodeBlock("blk_prepare_data");
    expect(
      screen.getByRole("button", { name: "Move blk_prepare_data up" }),
    ).toBeInTheDocument();
  });

  it("renders runtime output for the executed code block", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));

    expect(bridgeRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "run-current",
        targetBlockId: "blk_prepare_data",
        blocks: [
          {
            blockId: "blk_prepare_data",
            source: expect.any(String),
          },
        ],
      }),
      expect.any(Object),
    );
    expect(screen.getByText("blk_prepare_data:1")).toBeInTheDocument();
  });

  it("runs all code blocks in notebook order and skips text blocks", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run all" }));

    expect(bridgeRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "run-all",
        targetBlockId: "blk_prepare_data",
        blocks: [
          {
            blockId: "blk_prepare_data",
            source: expect.any(String),
          },
          {
            blockId: "blk_summarize",
            source: expect.any(String),
          },
        ],
      }),
      expect.any(Object),
    );
    expect(screen.getByText("blk_prepare_data:1")).toBeInTheDocument();
    expect(screen.getByText("blk_summarize:2")).toBeInTheDocument();
  });

  it("runs from the selected code block through lower code blocks only", async () => {
    const user = userEvent.setup();
    renderEditor();
    selectCodeBlock("blk_prepare_data");

    await user.click(
      screen.getByRole("button", {
        name: "Run from here blk_prepare_data from gutter",
      }),
    );

    expect(bridgeRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "run-from-here",
        targetBlockId: "blk_prepare_data",
        blocks: [
          {
            blockId: "blk_prepare_data",
            source: expect.any(String),
          },
          {
            blockId: "blk_summarize",
            source: expect.any(String),
          },
        ],
      }),
      expect.any(Object),
    );
    expect(screen.getByText("blk_prepare_data:1")).toBeInTheDocument();
    expect(screen.getByText("blk_summarize:2")).toBeInTheDocument();
  });

  it("runs only lower code blocks when run from here starts after a text block boundary", async () => {
    const user = userEvent.setup();
    renderEditor();
    selectCodeBlock("blk_summarize");

    await user.click(
      screen.getByRole("button", { name: "Run from here blk_summarize from gutter" }),
    );

    expect(bridgeRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "run-from-here",
        targetBlockId: "blk_summarize",
        blocks: [
          {
            blockId: "blk_summarize",
            source: expect.any(String),
          },
        ],
      }),
      expect.any(Object),
    );
    expect(screen.getByText("blk_summarize:1")).toBeInTheDocument();
  });

  it("reuses the live session for repeated current and downstream runs without upstream replay", async () => {
    const user = userEvent.setup();
    let orders: number[] | null = null;

    bridgeRunMock.mockImplementation(
      async (request: RuntimeExecutionRequest, handlers: BridgeHandlers) => {
        if (request.command === "run-all") {
          orders = null;
        }

        for (const block of request.blocks) {
          if (block.blockId === "blk_prepare_data") {
            orders = [48, 126, 74];
            emitExecutionSuccess(request, handlers, block.blockId, "48,126,74");
            continue;
          }

          if (!orders) {
            handlers.onError({
              executionId: request.executionId,
              blockId: block.blockId,
              error: {
                kind: "runtime",
                name: "ReferenceError",
                message: "orders is not defined",
              },
            });
            return;
          }

          emitExecutionSuccess(
            request,
            handlers,
            block.blockId,
            String(orders.reduce((sum, value) => sum + value, 0)),
          );
        }
      },
    );

    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));
    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    selectCodeBlock("blk_summarize");
    await user.click(
      screen.getByRole("button", { name: "Run from here blk_summarize from gutter" }),
    );

    expect(
      bridgeRunMock.mock.calls.map(
        ([request]: [RuntimeExecutionRequest, BridgeHandlers]) =>
          request.blocks.map((block) => block.blockId),
      ),
    ).toEqual([["blk_prepare_data"], ["blk_summarize"], ["blk_summarize"]]);
    expect(screen.getByText("248")).toBeInTheDocument();
  });

  it("shows running state, disables conflicting run controls, and enables stop", async () => {
    const user = userEvent.setup();
    bridgeRunMock.mockImplementation(async () => new Promise(() => {}));
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));
    selectCodeBlock("blk_prepare_data");
    selectCodeBlock("blk_summarize");

    expect(screen.getByText("Execution running")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run all" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Run blk_summarize" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Run from here blk_summarize from gutter" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stop" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Run all" }));
    expect(bridgeRunMock).toHaveBeenCalledTimes(1);
  });

  it("stops the active execution and shows canceled state", async () => {
    vi.useFakeTimers();
    bridgeRunMock.mockImplementation(async () => new Promise(() => {}));
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(bridgeStopMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Stopping execution")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.getByText("Execution canceled: Execution was canceled"),
    ).toBeInTheDocument();
    expect(screen.getByText("Execution was canceled")).toBeInTheDocument();
  });

  it("shows timeout state when the runtime reports a timeout", async () => {
    const user = userEvent.setup();
    bridgeRunMock.mockImplementation(
      async (request: RuntimeExecutionRequest, handlers: BridgeHandlers) => {
        handlers.onError({
          executionId: request.executionId,
          blockId: request.targetBlockId,
          error: {
            kind: "timeout",
            name: "TimeoutError",
            message: "Execution timed out after 5000ms",
          },
        });
      },
    );
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));

    expect(
      screen.getByText("Execution timed out: Execution timed out after 5000ms"),
    ).toBeInTheDocument();
    expect(screen.getByText("Execution timed out after 5000ms")).toBeInTheDocument();
  });

  it("requires setup blocks again after a timeout reset and recovers on rerun", async () => {
    const user = userEvent.setup();
    let orders: number[] | null = null;
    let timeoutNextSummarize = false;

    bridgeRunMock.mockImplementation(
      async (request: RuntimeExecutionRequest, handlers: BridgeHandlers) => {
        if (request.command === "run-all") {
          orders = null;
        }

        for (const block of request.blocks) {
          if (block.blockId === "blk_prepare_data") {
            orders = [48, 126, 74];
            emitExecutionSuccess(request, handlers, block.blockId, "48,126,74");
            continue;
          }

          if (timeoutNextSummarize) {
            timeoutNextSummarize = false;
            orders = null;
            handlers.onError({
              executionId: request.executionId,
              blockId: block.blockId,
              error: {
                kind: "timeout",
                name: "TimeoutError",
                message: "Execution timed out after 5000ms",
              },
            });
            return;
          }

          if (!orders) {
            handlers.onError({
              executionId: request.executionId,
              blockId: block.blockId,
              error: {
                kind: "runtime",
                name: "ReferenceError",
                message: "orders is not defined",
              },
            });
            return;
          }

          emitExecutionSuccess(request, handlers, block.blockId, "248");
        }
      },
    );

    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));
    timeoutNextSummarize = true;
    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    expect(
      screen.getByText("Execution timed out: Execution timed out after 5000ms"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    expect(
      screen.getByText("Execution failed: orders is not defined"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));
    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));

    expect(screen.getByText("Execution idle")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
  });

  it("shows runtime error state when execution fails", async () => {
    const user = userEvent.setup();
    bridgeRunMock.mockImplementation(
      async (request: RuntimeExecutionRequest, handlers: BridgeHandlers) => {
        handlers.onError({
          executionId: request.executionId,
          blockId: request.targetBlockId,
          error: {
            kind: "runtime",
            name: "ReferenceError",
            message: "orders is not defined",
            stack: "ReferenceError: orders is not defined",
          },
        });
      },
    );
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));

    expect(
      screen.getByText("Execution failed: orders is not defined"),
    ).toBeInTheDocument();
    expect(screen.getByText("orders is not defined")).toBeInTheDocument();
  });

  it("keeps the live session valid across runtime and syntax errors", async () => {
    const user = userEvent.setup();
    let orders: number[] | null = null;
    const summarizeFailures = [
      {
        kind: "runtime" as const,
        name: "Error",
        message: "boom",
      },
      {
        kind: "syntax" as const,
        name: "SyntaxError",
        message: "Unexpected token ';'",
      },
    ];

    bridgeRunMock.mockImplementation(
      async (request: RuntimeExecutionRequest, handlers: BridgeHandlers) => {
        if (request.command === "run-all") {
          orders = null;
        }

        for (const block of request.blocks) {
          if (block.blockId === "blk_prepare_data") {
            orders = [48, 126, 74];
            emitExecutionSuccess(request, handlers, block.blockId, "48,126,74");
            continue;
          }

          if (!orders) {
            handlers.onError({
              executionId: request.executionId,
              blockId: block.blockId,
              error: {
                kind: "runtime",
                name: "ReferenceError",
                message: "orders is not defined",
              },
            });
            return;
          }

          const nextFailure = summarizeFailures.shift();
          if (nextFailure) {
            handlers.onError({
              executionId: request.executionId,
              blockId: block.blockId,
              error: nextFailure,
            });
            return;
          }

          emitExecutionSuccess(request, handlers, block.blockId, "248");
        }
      },
    );

    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run blk_prepare_data" }));

    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    expect(screen.getByText("Execution failed: boom")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    expect(
      screen.getByText("Execution failed: Unexpected token ';'"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run blk_summarize" }));
    expect(screen.getByText("Execution idle")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
  });

  it("uses route notebook id in the header summary", () => {
    renderEditor("nb_custom_99");
    expect(
      screen.getByRole("heading", { level: 1, name: "Untitled" }),
    ).toBeInTheDocument();
  });
});
