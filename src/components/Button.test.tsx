import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children as the accessible name", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("defaults to type=button", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: /go/i })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("honors an explicit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: /send/i })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("applies the primary variant classes and merges extra className", () => {
    render(
      <Button variant="primary" className="w-full">
        Primary
      </Button>
    );
    const btn = screen.getByRole("button", { name: /primary/i });
    expect(btn.className).toContain("bg-accent");
    expect(btn.className).toContain("w-full");
  });

  it("forwards onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button", { name: /click/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
