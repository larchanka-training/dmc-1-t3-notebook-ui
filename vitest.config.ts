/**
 * Vitest configuration — spec QA-UI-COMPONENT-TEST-INFRA
 *
 * Owns all test-runner settings. The inline `test` block in vite.config.ts is
 * intentionally removed; this file is the single source of truth for Vitest.
 *
 * Cross-environment guarantee: all paths are POSIX-relative, no OS-specific
 * separators, no system-browser dependency (jsdom is in-process).
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { alias } from "./vite.config";

export default defineConfig({
  // Re-use the same React transform the Vite dev server uses, so component
  // tests see the exact same JSX transform as production code.
  plugins: [react()],

  // Single source of truth: alias map is imported from vite.config.ts so
  // Vitest and Vite can never drift (spec §6.2 / §6.3).
  resolve: { alias },

  test: {
    // ── Environment ───────────────────────────────────────────────────────
    // jsdom runs in-process: no system Chrome/WebKit needed.
    // Identical on macOS, Windows, Linux, and AWS/CI headless runners (§8 E2).
    environment: "jsdom",

    // ── Globals ────────────────────────────────────────────────────────────
    // describe/it/expect available without import in every test file.
    globals: true,

    // ── Setup ──────────────────────────────────────────────────────────────
    // Auto-loaded before every test: jest-dom matchers, MSW lifecycle, cleanup.
    // Authors never create per-test setup files (spec §6.5).
    setupFiles: ["./test/setup.ts"],

    // ── CSS ────────────────────────────────────────────────────────────────
    // Allow CSS imports in component files without crashing the test runner.
    css: true,

    // ── File collection ────────────────────────────────────────────────────
    // Colocated convention: *.test.ts(x) / *.spec.ts(x) next to the source.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Playwright coexistence (spec §7 P1): Vitest must never collect E2E specs.
    exclude: ["node_modules", "dist", "e2e/**", "**/*.e2e.{ts,tsx}", "playwright/**"],

    // ── Reporters ──────────────────────────────────────────────────────────
    // default  → human-readable output in the terminal.
    // junit    → machine-readable artifact consumed by GitHub Actions /
    //            AWS CodeBuild without transformation (spec §8 E6).
    // Path is POSIX-relative; Vitest creates the directory automatically.
    reporters: ["default", ["junit", { outputFile: "./reports/junit-ui.xml" }]],

    // ── Coverage ───────────────────────────────────────────────────────────
    // v8 provider: zero-config, ships with Node, no Babel or Istanbul needed.
    // Artifacts are in ui/coverage/ (text + HTML for local, lcov for CI).
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "html", "lcov"],
      // Generate coverage even when some tests fail (Vitest 4 default is false).
      // Required for CI dashboards that consume lcov/html alongside a failing suite.
      reportOnFailure: true,
    },
  },
});
