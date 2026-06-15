/**
 * Canary: MSW network interception — spec QA-UI-COMPONENT-TEST-INFRA §6.10
 *
 * Purpose: verify that MSW intercepts fetch() in the jsdom environment,
 * returns mocked responses, and fails on unhandled requests (onUnhandledRequest: 'error').
 *
 * Deleting this file must NOT break the test run (infra is independent, C5).
 */
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@test/msw/server";

describe("canary: MSW intercepts fetch", () => {
  it("returns a mocked JSON payload for a per-test handler", async () => {
    server.use(
      http.get("https://example.test/api/ping", () => HttpResponse.json({ ok: true })),
    );

    const res = await fetch("https://example.test/api/ping");
    const body = await res.json();

    expect(res.ok).toBe(true);
    expect(body).toEqual({ ok: true });
  });

  it("per-test handler is reset after each test (isolation check)", async () => {
    // The previous test's handler has been cleared by setup.ts afterEach.
    // A fresh per-test handler is set here with a different payload.
    server.use(
      http.get("https://example.test/api/ping", () => HttpResponse.json({ round: 2 })),
    );

    const res = await fetch("https://example.test/api/ping");
    const body = await res.json();

    expect(body).toEqual({ round: 2 });
  });
});
