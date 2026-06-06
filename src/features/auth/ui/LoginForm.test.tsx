import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@test/msw/server";
import { useAppStore } from "@/app/model";
import { renderWithProviders } from "@test/renderWithProviders";
import { LoginForm } from "./LoginForm";

const renderLoginForm = (entry = "/login") =>
  renderWithProviders(
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

  it("shows an error when request-otp fails", async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/one-time code/i)).toBeInTheDocument();
    });

    server.use(
      http.post("/api/v1/auth/request-otp", () =>
        HttpResponse.json(
          {
            error: {
              code: "otp_request_rate_limited",
              message: "Too many OTP requests.",
            },
          },
          { status: 429 },
        ),
      ),
    );

    await user.click(screen.getByRole("button", { name: /resend code/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/too many requests/i);
  });

  it("does not show the OTP input before a code is requested", () => {
    renderLoginForm();
    expect(screen.queryByLabelText(/one-time code/i)).not.toBeInTheDocument();
  });

  it("Google sign-in navigates to OAuth start URL", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...globalThis.location, assign });

    renderLoginForm();
    await userEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    expect(assign).toHaveBeenCalledWith("/api/v1/auth/google/start");
    vi.unstubAllGlobals();
  });
});

describe("LoginForm — verify step", () => {
  const submitEmail = async (value: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), value);
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/one-time code/i)).toBeInTheDocument();
    });
  };

  it("advances to the verify step and shows where the code was sent", async () => {
    renderLoginForm();
    await submitEmail("user@example.com");
    expect(screen.getByText(/code sent to/i)).toHaveTextContent("user@example.com");
  });

  it("does not show dev OTP hint outside development", async () => {
    vi.stubEnv("DEV", false);
    renderLoginForm();
    await submitEmail("user@example.com");
    expect(screen.queryByText(/development code/i)).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it("shows an error and stays unauthenticated on a wrong code", async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await submitEmail("user@example.com");
    await user.type(screen.getByLabelText(/one-time code/i), "000000");
    await user.click(screen.getByRole("button", { name: /verify code/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid code/i);
    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
  });

  it("authenticates and navigates to /notebooks with a valid code", async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await submitEmail("user@example.com");
    await user.type(screen.getByLabelText(/one-time code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));
    expect(await screen.findByText("notebooks list")).toBeInTheDocument();
    expect(useAppStore.getState().auth.isAuthenticated).toBe(true);
    expect(useAppStore.getState().auth.user?.email).toBe("user@example.com");
    expect(useAppStore.getState().auth.user?.id).toBe("usr_test");
    expect(useAppStore.getState().auth.authenticatedAt).toBeTruthy();
  });

  it("'Change email' returns to the request step and clears the code", async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await submitEmail("user@example.com");
    await user.type(screen.getByLabelText(/one-time code/i), "12");
    await user.click(screen.getByRole("button", { name: /change email/i }));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/one-time code/i)).not.toBeInTheDocument();
  });
});
