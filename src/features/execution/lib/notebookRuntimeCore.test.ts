import { describe, expect, it } from "vitest";
import type { RuntimeToAppMessage } from "../model/types";
import { createNotebookRuntimeCore } from "./notebookRuntimeCore";

function collectMessages() {
  const messages: RuntimeToAppMessage[] = [];
  const runtime = createNotebookRuntimeCore((message) => {
    messages.push(message);
  });

  return { messages, runtime };
}

describe("createNotebookRuntimeCore", () => {
  it("reuses session state across sequential runs", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];",
      },
    ]);
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_summarize",
        source: "orders.reduce((sum, value) => sum + value, 0);",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_prepare_data" },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_prepare_data",
      },
      { type: "execution-started", executionId: "exec_2", blockId: "blk_summarize" },
      {
        type: "execution-output",
        executionId: "exec_2",
        blockId: "blk_summarize",
        output: { type: "text", payload: "248" },
      },
      { type: "execution-complete", executionId: "exec_2", blockId: "blk_summarize" },
    ]);
  });

  it("clears prior session state on reset", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];",
      },
    ]);
    runtime.resetSession();
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_summarize",
        source: "orders.length;",
      },
    ]);

    expect(messages[messages.length - 1]).toEqual({
      type: "execution-error",
      executionId: "exec_2",
      blockId: "blk_summarize",
      error: expect.objectContaining({
        kind: "runtime",
        name: "ReferenceError",
      }),
    });
  });

  it("allows rerunning the same block without redeclaration errors", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];\norders.length;",
      },
    ]);
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];\norders.length;",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_prepare_data" },
      {
        type: "execution-output",
        executionId: "exec_1",
        blockId: "blk_prepare_data",
        output: { type: "text", payload: "3" },
      },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_prepare_data",
      },
      { type: "execution-started", executionId: "exec_2", blockId: "blk_prepare_data" },
      {
        type: "execution-output",
        executionId: "exec_2",
        blockId: "blk_prepare_data",
        output: { type: "text", payload: "3" },
      },
      {
        type: "execution-complete",
        executionId: "exec_2",
        blockId: "blk_prepare_data",
      },
    ]);
  });

  it("runs only the blocks provided for a downstream rerun", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];",
      },
      {
        blockId: "blk_summarize",
        source: "orders.reduce((sum, value) => sum + value, 0);",
      },
    ]);

    messages.length = 0;

    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_summarize",
        source: "orders.reduce((sum, value) => sum + value, 0);",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_2", blockId: "blk_summarize" },
      {
        type: "execution-output",
        executionId: "exec_2",
        blockId: "blk_summarize",
        output: { type: "text", payload: "248" },
      },
      { type: "execution-complete", executionId: "exec_2", blockId: "blk_summarize" },
    ]);
  });

  it("keeps live mutable state across sequential downstream runs", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_counter",
        source: "let counter = 0;",
      },
    ]);
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_increment_counter",
        source: "counter += 1;\ncounter;",
      },
    ]);
    await runtime.runBlocks("exec_3", [
      {
        blockId: "blk_increment_counter",
        source: "counter += 1;\ncounter;",
      },
    ]);

    expect(messages).toEqual([
      {
        type: "execution-started",
        executionId: "exec_1",
        blockId: "blk_prepare_counter",
      },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_prepare_counter",
      },
      {
        type: "execution-started",
        executionId: "exec_2",
        blockId: "blk_increment_counter",
      },
      {
        type: "execution-output",
        executionId: "exec_2",
        blockId: "blk_increment_counter",
        output: { type: "text", payload: "1" },
      },
      {
        type: "execution-complete",
        executionId: "exec_2",
        blockId: "blk_increment_counter",
      },
      {
        type: "execution-started",
        executionId: "exec_3",
        blockId: "blk_increment_counter",
      },
      {
        type: "execution-output",
        executionId: "exec_3",
        blockId: "blk_increment_counter",
        output: { type: "text", payload: "2" },
      },
      {
        type: "execution-complete",
        executionId: "exec_3",
        blockId: "blk_increment_counter",
      },
    ]);
  });

  it("updates persistent function bindings when a block is rerun", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_define_formatter",
        source: "function summarizeOrders(orders) { return orders.length; }",
      },
      {
        blockId: "blk_use_formatter",
        source: "summarizeOrders([48, 126, 74]);",
      },
    ]);

    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_define_formatter",
        source:
          "function summarizeOrders(orders) { return orders.reduce((sum, value) => sum + value, 0); }",
      },
    ]);
    await runtime.runBlocks("exec_3", [
      {
        blockId: "blk_use_formatter",
        source: "summarizeOrders([48, 126, 74]);",
      },
    ]);

    expect(messages).toEqual([
      {
        type: "execution-started",
        executionId: "exec_1",
        blockId: "blk_define_formatter",
      },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_define_formatter",
      },
      {
        type: "execution-started",
        executionId: "exec_1",
        blockId: "blk_use_formatter",
      },
      {
        type: "execution-output",
        executionId: "exec_1",
        blockId: "blk_use_formatter",
        output: { type: "text", payload: "3" },
      },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_use_formatter",
      },
      {
        type: "execution-started",
        executionId: "exec_2",
        blockId: "blk_define_formatter",
      },
      {
        type: "execution-complete",
        executionId: "exec_2",
        blockId: "blk_define_formatter",
      },
      {
        type: "execution-started",
        executionId: "exec_3",
        blockId: "blk_use_formatter",
      },
      {
        type: "execution-output",
        executionId: "exec_3",
        blockId: "blk_use_formatter",
        output: { type: "text", payload: "248" },
      },
      {
        type: "execution-complete",
        executionId: "exec_3",
        blockId: "blk_use_formatter",
      },
    ]);
  });

  it("does not silently restore missing upstream state on a fresh session", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_summarize",
        source: "orders.reduce((sum, value) => sum + value, 0);",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_summarize" },
      {
        type: "execution-error",
        executionId: "exec_1",
        blockId: "blk_summarize",
        error: expect.objectContaining({
          kind: "runtime",
          name: "ReferenceError",
        }),
      },
    ]);
  });

  it("normalizes syntax errors", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_invalid",
        source: "const answer = ;",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_invalid" },
      {
        type: "execution-error",
        executionId: "exec_1",
        blockId: "blk_invalid",
        error: expect.objectContaining({
          kind: "syntax",
          name: "SyntaxError",
        }),
      },
    ]);
  });

  it("keeps the existing session state after a syntax error", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];",
      },
    ]);
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_invalid",
        source: "const answer = ;",
      },
    ]);
    await runtime.runBlocks("exec_3", [
      {
        blockId: "blk_summarize",
        source: "orders.length;",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_prepare_data" },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_prepare_data",
      },
      { type: "execution-started", executionId: "exec_2", blockId: "blk_invalid" },
      {
        type: "execution-error",
        executionId: "exec_2",
        blockId: "blk_invalid",
        error: expect.objectContaining({
          kind: "syntax",
          name: "SyntaxError",
        }),
      },
      { type: "execution-started", executionId: "exec_3", blockId: "blk_summarize" },
      {
        type: "execution-output",
        executionId: "exec_3",
        blockId: "blk_summarize",
        output: { type: "text", payload: "3" },
      },
      { type: "execution-complete", executionId: "exec_3", blockId: "blk_summarize" },
    ]);
  });

  it("keeps the existing session state after a runtime error", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_prepare_data",
        source: "const orders = [48, 126, 74];",
      },
    ]);
    await runtime.runBlocks("exec_2", [
      {
        blockId: "blk_fail",
        source: "throw new Error('boom');",
      },
    ]);
    await runtime.runBlocks("exec_3", [
      {
        blockId: "blk_summarize",
        source: "orders.length;",
      },
    ]);

    expect(messages).toEqual([
      { type: "execution-started", executionId: "exec_1", blockId: "blk_prepare_data" },
      {
        type: "execution-complete",
        executionId: "exec_1",
        blockId: "blk_prepare_data",
      },
      { type: "execution-started", executionId: "exec_2", blockId: "blk_fail" },
      {
        type: "execution-error",
        executionId: "exec_2",
        blockId: "blk_fail",
        error: expect.objectContaining({
          kind: "runtime",
          name: "Error",
          message: "boom",
        }),
      },
      { type: "execution-started", executionId: "exec_3", blockId: "blk_summarize" },
      {
        type: "execution-output",
        executionId: "exec_3",
        blockId: "blk_summarize",
        output: { type: "text", payload: "3" },
      },
      { type: "execution-complete", executionId: "exec_3", blockId: "blk_summarize" },
    ]);
  });

  it("normalizes console.table output into table payloads", async () => {
    const { messages, runtime } = collectMessages();

    await runtime.runBlocks("exec_1", [
      {
        blockId: "blk_table",
        source: "console.table([{ id: 1, total: 48 }, { id: 2, total: 126 }]);",
      },
    ]);

    expect(messages).toContainEqual({
      type: "execution-output",
      executionId: "exec_1",
      blockId: "blk_table",
      output: {
        type: "table",
        payload: {
          columns: ["id", "total"],
          rows: [
            [1, 48],
            [2, 126],
          ],
        },
      },
    });
  });
});
