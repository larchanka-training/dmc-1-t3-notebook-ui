import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useAppStore } from "../store";
import { routes } from "./routes";

const at = (path: string) =>
  render(
    <RouterProvider
      router={createMemoryRouter(routes, { initialEntries: [path] })}
    />
  );

describe("routes", () => {
  it("opens at /login for the index path", () => {
    at("/");
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("redirects an unknown path to /login", () => {
    at("/totally-unknown");
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("blocks /notebooks when unauthenticated", () => {
    at("/notebooks");
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("allows /notebooks when authenticated", () => {
    useAppStore.getState().setAuthenticated(true, "user@example.com");
    at("/notebooks");
    expect(
      screen.queryByRole("heading", { name: /sign in/i, level: 1 })
    ).not.toBeInTheDocument();
  });
});
