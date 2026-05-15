import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renders email and OTP inputs with labels", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/one-time code/i)).toBeInTheDocument();
  });

  it("renders both submit actions and the Google sign-in button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /send code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("renders the page heading", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 1 })
    ).toBeInTheDocument();
  });

  // Stub handlers: forms must not trigger a page reload (preventDefault),
  // Google action is an intentional no-op until auth is wired.
  it("email form submit is prevented by the stub handler", () => {
    render(<LoginPage />);
    const form = screen
      .getByRole("button", { name: /send code/i })
      .closest("form");
    expect(form).not.toBeNull();
    expect(fireEvent.submit(form!)).toBe(false);
  });

  it("OTP form submit is prevented by the stub handler", () => {
    render(<LoginPage />);
    const form = screen
      .getByRole("button", { name: /verify code/i })
      .closest("form");
    expect(form).not.toBeNull();
    expect(fireEvent.submit(form!)).toBe(false);
  });

  it("Google sign-in stub handler is a safe no-op", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", {
      name: /sign in with google/i
    });
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toBeInTheDocument();
  });
});
