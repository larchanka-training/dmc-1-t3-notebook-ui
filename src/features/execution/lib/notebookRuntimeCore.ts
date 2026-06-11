import type {
  ExecutionOutput,
  NormalizedExecutionError,
  RuntimeSourceBlock,
  RuntimeToAppMessage,
} from "../model/types";

type RuntimePostMessage = (message: RuntimeToAppMessage) => void;

type RuntimeConsole = {
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  table: (value: unknown) => void;
  warn: (...args: unknown[]) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatPrimitive(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    value === null ||
    value === undefined
  ) {
    return String(value);
  }

  return null;
}

function toTableOutput(value: unknown): ExecutionOutput | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  if (value.every((row) => Array.isArray(row))) {
    const rows = value as unknown[][];
    const width = Math.max(...rows.map((row) => row.length), 0);

    return {
      type: "table",
      payload: {
        columns: Array.from({ length: width }, (_, index) => `col_${index + 1}`),
        rows,
      },
    };
  }

  if (!value.every(isRecord)) {
    return null;
  }

  const rows = value as Record<string, unknown>[];
  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  return {
    type: "table",
    payload: {
      columns,
      rows: rows.map((row) => columns.map((column) => row[column])),
    },
  };
}

function normalizeValue(value: unknown): ExecutionOutput {
  const primitive = formatPrimitive(value);

  if (primitive !== null) {
    return {
      type: "text",
      payload: primitive,
    };
  }

  const table = toTableOutput(value);
  if (table) {
    return table;
  }

  return {
    type: "object",
    payload: value,
  };
}

function normalizeConsoleArgs(args: unknown[]): ExecutionOutput {
  if (args.length === 1) {
    return normalizeValue(args[0]);
  }

  return {
    type: "text",
    payload: args
      .map((arg) => {
        const primitive = formatPrimitive(arg);
        if (primitive !== null) {
          return primitive;
        }

        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(" "),
  };
}

function normalizeRuntimeError(error: unknown): NormalizedExecutionError {
  if (error instanceof SyntaxError) {
    return {
      kind: "syntax",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "runtime",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    kind: "runtime",
    message: typeof error === "string" ? error : "Unknown runtime error",
  };
}

function joinSources(blocks: RuntimeSourceBlock[]) {
  return blocks.map((block) => block.source).join("\n\n");
}

export function createNotebookRuntimeCore(postMessage: RuntimePostMessage) {
  const sessionBlocks: RuntimeSourceBlock[] = [];

  const truncateSessionFromIncomingBlocks = (blocks: RuntimeSourceBlock[]) => {
    const overlapIndexes = blocks
      .map((block) =>
        sessionBlocks.findIndex(
          (sessionBlock) => sessionBlock.blockId === block.blockId,
        ),
      )
      .filter((index) => index >= 0);

    if (overlapIndexes.length === 0) {
      return;
    }

    const truncateFrom = Math.min(...overlapIndexes);
    sessionBlocks.splice(truncateFrom);
  };

  const emitOutput = (
    executionId: string,
    blockId: string,
    output: ExecutionOutput,
  ) => {
    postMessage({
      type: "execution-output",
      executionId,
      blockId,
      output,
    });
  };

  const createRuntimeConsole = (
    executionId: string,
    blockId: string,
  ): RuntimeConsole => ({
    log: (...args) => {
      emitOutput(executionId, blockId, normalizeConsoleArgs(args));
    },
    info: (...args) => {
      emitOutput(executionId, blockId, normalizeConsoleArgs(args));
    },
    warn: (...args) => {
      emitOutput(executionId, blockId, normalizeConsoleArgs(args));
    },
    error: (...args) => {
      emitOutput(executionId, blockId, normalizeConsoleArgs(args));
    },
    table: (value) => {
      emitOutput(executionId, blockId, toTableOutput(value) ?? normalizeValue(value));
    },
  });

  const executeBlock = async (executionId: string, block: RuntimeSourceBlock) => {
    postMessage({
      type: "execution-started",
      executionId,
      blockId: block.blockId,
    });

    const runtimeConsole = createRuntimeConsole(executionId, block.blockId);
    const replaySource = joinSources(sessionBlocks);
    const userSource = block.source.trim();
    const program = [
      "const console = globalThis.__notebookConsole;",
      replaySource,
      userSource,
    ]
      .filter((segment) => segment.length > 0)
      .join("\n\n");

    try {
      (
        globalThis as typeof globalThis & { __notebookConsole?: RuntimeConsole }
      ).__notebookConsole = runtimeConsole;
      const result = eval(program) as unknown;
      if (result !== undefined) {
        emitOutput(executionId, block.blockId, normalizeValue(result));
      }
      sessionBlocks.push(block);
      postMessage({
        type: "execution-complete",
        executionId,
        blockId: block.blockId,
      });
      return true;
    } catch (error) {
      postMessage({
        type: "execution-error",
        executionId,
        blockId: block.blockId,
        error: normalizeRuntimeError(error),
      });
      return false;
    } finally {
      delete (globalThis as typeof globalThis & { __notebookConsole?: RuntimeConsole })
        .__notebookConsole;
    }
  };

  return {
    async runBlocks(executionId: string, blocks: RuntimeSourceBlock[]) {
      truncateSessionFromIncomingBlocks(blocks);

      for (const block of blocks) {
        const succeeded = await executeBlock(executionId, block);
        if (!succeeded) {
          break;
        }
      }
    },
    resetSession() {
      sessionBlocks.length = 0;
    },
    terminateSession() {
      sessionBlocks.length = 0;
    },
  };
}
