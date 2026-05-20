import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Brand } from "./Brand";

describe("Brand", () => {
  it("renders the logo mark and the product wordmark", () => {
    render(<Brand />);
    expect(screen.getByRole("img", { name: /js notebook logo/i })).toBeInTheDocument();
    expect(screen.getByText("JS Notebook")).toBeInTheDocument();
  });
});
