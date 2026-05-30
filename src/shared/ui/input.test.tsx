import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "@/shared/ui";

describe("Input", () => {
  it("renders with accessible label association", () => {
    render(
      <label htmlFor="email">
        Email
        <Input id="email" type="email" />
      </label>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
