export type BlockOutput =
  | { type: "text"; payload: string }
  | { type: "object"; payload: unknown }
  | { type: "table"; payload: { columns: string[]; rows: unknown[][] } }
  | { type: "chart"; payload: unknown }
  | { type: "error"; payload: { message: string; stack?: string } };

export interface ExecutionSlice {
  execution: {
    status: "idle" | "running" | "stopping";
    targetBlockId: string | null;
    runningBlockIds: string[];
    outputs: Record<string, BlockOutput>;
    error: string | null;
  };
}
