import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { OutputView } from "./OutputView";

describe("OutputView", () => {
  it("shows an empty latest-run state when no outputs exist for the block", () => {
    render(<OutputView blockId="blk_1" />);

    expect(screen.getByLabelText("Output area for blk_1")).toBeInTheDocument();
    expect(
      screen.getByText("No runtime output yet for the latest run."),
    ).toBeInTheDocument();
  });

  it("shows a running state when the latest run started but no outputs arrived yet", () => {
    render(<OutputView blockId="blk_1" outputs={[]} />);

    expect(
      screen.getByText("Execution started. Waiting for runtime outputs."),
    ).toBeInTheDocument();
  });

  it("renders text output", () => {
    render(
      <OutputView
        blockId="blk_1"
        outputs={[{ type: "text", payload: "total: 248" }]}
      />,
    );

    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText("total: 248")).toBeInTheDocument();
  });

  it("renders object output as formatted JSON", () => {
    render(
      <OutputView
        blockId="blk_1"
        outputs={[{ type: "object", payload: { total: 248, average: 82.67 } }]}
      />,
    );

    expect(screen.getByText("object")).toBeInTheDocument();
    expect(screen.getByText(/"total": 248/)).toBeInTheDocument();
    expect(screen.getByText(/"average": 82.67/)).toBeInTheDocument();
  });

  it("renders table output", () => {
    render(
      <OutputView
        blockId="blk_1"
        outputs={[
          {
            type: "table",
            payload: {
              columns: ["id", "total"],
              rows: [
                [1, 48],
                [2, 126],
              ],
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "id" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "total" })).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.getByText("126")).toBeInTheDocument();
  });

  it("renders error output with stack details when available", () => {
    render(
      <OutputView
        blockId="blk_1"
        outputs={[
          {
            type: "error",
            payload: {
              name: "ReferenceError",
              message: "orders is not defined",
              stack: "ReferenceError: orders is not defined\n at blk_1",
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByText("orders is not defined")).toBeInTheDocument();
    expect(
      screen.getByText(/ReferenceError: orders is not defined/),
    ).toBeInTheDocument();
  });
});
