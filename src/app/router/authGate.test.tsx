import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { useAppStore } from "@/app/model";
import { AUTH_STORAGE_KEY } from "@/app/model/persist";
import { queryClient } from "@/app/providers/queryClient";
import { routes } from "@/app/router/routes";
import { testUser } from "@test/authFixtures";

describe("auth gate", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("rejects stale localStorage auth when session is anonymous", async () => {
    globalThis.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          auth: {
            isAuthenticated: true,
            user: testUser("stale@example.com"),
            authenticatedAt: "2026-05-14T10:00:00Z",
          },
        },
      }),
    );
    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
    expect(useAppStore.getState().auth.status).toBe("checking");

    const router = createMemoryRouter(routes, { initialEntries: ["/notebooks"] });
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    await waitFor(
      () => {
        expect(useAppStore.getState().auth.status).toBe("idle");
        expect(useAppStore.getState().auth.isAuthenticated).toBe(false);
        expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
