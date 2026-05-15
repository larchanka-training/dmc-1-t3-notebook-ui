import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders its children", () => {
    render(<EmptyState>Nothing here yet</EmptyState>);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });
});
