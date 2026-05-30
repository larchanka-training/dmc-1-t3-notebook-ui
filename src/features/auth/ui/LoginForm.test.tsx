import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "@/app/model";
import { LoginForm } from "./LoginForm";

const renderLoginForm = (entry = "/login") =>
  render(
    <RouterProvider
      router={createMemoryRouter(
        [
          { path: "/login", element: <LoginForm /> },
          { path: "/notebooks", element: <div>notebooks list</div> },
        ],
        { initialEntries: [entry] },
      )}
    />,
  );

describe("LoginForm — request step", () => {
  it("shows the heading, email input, Send code and Google button", () => {
    renderLoginForm();
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send code/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("does not show the OTP input before a code is requested", () => {
    renderLoginForm();
    expect(screen.queryByLabelText(/one-time code/i)).not.toBeInTheDocument();
  });

  it("Google sign-in stub is a safe no-op", () => {
    renderLoginForm();
    const button = screen.getByRole("button", { name: /continue with google/i });
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toBeInTheDocument();
  });
});

describe("LoginForm — verify step", () => {
  const submitEmail = (value: string) => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value } });
    fireEvent.submit(
      screen.getByRole("button", { name: /send code/i }).closest("form")!,
    );
  };

  it("advances to the verify step and shows where the code was sent", () => {
    renderLoginForm();
    submitEmail("user@example.com");
    expect(screen.getByLabelText(/one-time code/i)).toBeInTheDocument();
    expect(screen.getByText(/code sent to/i)).toHaveTextContent("user@example.com");
  });

  it("shows an error and stays unauthenticated on a wrong code", () => {
    renderLoginForm();
    submitEmail("user@example.com");
    fireEvent.change(screen.getByLabelText(/one-time code/i), {
      target: { value: "0000" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /verify code/i }).closest("form")!,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid code/i);
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
  });

  it("authenticates and navigates to /notebooks when the code is 1234", async () => {
    const user = userEvent.setup();
    renderLoginForm();
    submitEmail("user@example.com");
    await user.type(screen.getByLabelText(/one-time code/i), "1234");
    await user.click(screen.getByRole("button", { name: /verify code/i }));
    expect(await screen.findByText("notebooks list")).toBeInTheDocument();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
    expect(useAppStore.getState().auth.userEmail).toBe("user@example.com");
  });

  it("'Change email' returns to the request step and clears the code", () => {
    renderLoginForm();
    submitEmail("user@example.com");
    fireEvent.change(screen.getByLabelText(/one-time code/i), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /change email/i }));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/one-time code/i)).not.toBeInTheDocument();
  });
});
