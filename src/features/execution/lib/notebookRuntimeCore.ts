import type {
  ExecutionOutput,
  NormalizedExecutionError,
  RuntimeSourceBlock,
  RuntimeToAppMessage,
} from "../model/types";
import * as ts from "typescript";

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

type RuntimeScope = Record<string, unknown>;

type BindingCollector = {
  count: number;
};

function collectBindingIdentifiers(
  name: ts.BindingName,
  identifiers: string[] = [],
): string[] {
  if (ts.isIdentifier(name)) {
    identifiers.push(name.text);
    return identifiers;
  }

  for (const element of name.elements) {
    if (ts.isOmittedExpression(element)) {
      continue;
    }

    collectBindingIdentifiers(element.name, identifiers);
  }

  return identifiers;
}

function buildVariableBindingStatement(
  declaration: ts.VariableDeclaration,
  sourceFile: ts.SourceFile,
  collector: BindingCollector,
): string {
  const bindingNames = collectBindingIdentifiers(declaration.name);
  const initializer = declaration.initializer
    ? declaration.initializer.getText(sourceFile)
    : "undefined";

  if (bindingNames.length === 1 && ts.isIdentifier(declaration.name)) {
    const [identifier] = bindingNames;
    return `__notebookScope[${JSON.stringify(identifier)}] = (${initializer});`;
  }

  const tempName = `__notebookTmp_${collector.count}`;
  collector.count += 1;
  const bindingPattern = declaration.name.getText(sourceFile);
  const assignments = bindingNames
    .map(
      (identifier) => `__notebookScope[${JSON.stringify(identifier)}] = ${identifier};`,
    )
    .join("\n");

  return `{
const ${tempName} = (${initializer});
const ${bindingPattern} = ${tempName};
${assignments}
}`;
}

function toPersistentBindingStatement(
  statement: ts.Statement,
  sourceFile: ts.SourceFile,
  collector: BindingCollector,
): string {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations
      .map((declaration) =>
        buildVariableBindingStatement(declaration, sourceFile, collector),
      )
      .join("\n");
  }

  if (ts.isFunctionDeclaration(statement) && statement.name) {
    return `__notebookScope[${JSON.stringify(statement.name.text)}] = ${statement.getText(sourceFile)};`;
  }

  if (ts.isClassDeclaration(statement) && statement.name) {
    return `__notebookScope[${JSON.stringify(statement.name.text)}] = ${statement.getText(sourceFile)};`;
  }

  return statement.getText(sourceFile);
}

function transformBlockSource(source: string): string[] {
  const sourceFile = ts.createSourceFile(
    "notebook-block.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const collector: BindingCollector = { count: 0 };

  return sourceFile.statements.map((statement, index, statements) => {
    const isLastStatement = index === statements.length - 1;

    if (isLastStatement && ts.isExpressionStatement(statement)) {
      return `return (${statement.expression.getText(sourceFile)});`;
    }

    return toPersistentBindingStatement(statement, sourceFile, collector);
  });
}

async function runInLiveSession(
  scope: RuntimeScope,
  runtimeConsole: RuntimeConsole,
  source: string,
) {
  const statements = transformBlockSource(source);
  const body = [
    "const console = __notebookConsole;",
    "with (__notebookScope) {",
    ...statements,
    "}",
  ].join("\n");
  const AsyncFunction = Object.getPrototypeOf(async function () {
    return undefined;
  }).constructor as new (
    ...args: string[]
  ) => (...values: unknown[]) => Promise<unknown>;
  const execute = new AsyncFunction("__notebookScope", "__notebookConsole", body);
  return execute(scope, runtimeConsole);
}

export function createNotebookRuntimeCore(postMessage: RuntimePostMessage) {
  const sessionScope: RuntimeScope = Object.create(null) as RuntimeScope;

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

    try {
      const result = await runInLiveSession(
        sessionScope,
        runtimeConsole,
        block.source.trim(),
      );
      if (result !== undefined) {
        emitOutput(executionId, block.blockId, normalizeValue(result));
      }
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
    }
  };

  return {
    async runBlocks(executionId: string, blocks: RuntimeSourceBlock[]) {
      for (const block of blocks) {
        const succeeded = await executeBlock(executionId, block);
        if (!succeeded) {
          break;
        }
      }
    },
    resetSession() {
      for (const key of Object.keys(sessionScope)) {
        delete sessionScope[key];
      }
    },
    terminateSession() {
      for (const key of Object.keys(sessionScope)) {
        delete sessionScope[key];
      }
    },
  };
}
