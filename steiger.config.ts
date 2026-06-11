import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

/**
 * FSD lint for ui/src.
 * @see ui/docs/adr/ADR-014-fsd-architecture-lint.md
 */
export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      "fsd/forbidden-imports": "off",
      "fsd/no-cross-imports": "error",
      "fsd/no-higher-level-imports": "error",
      // Version 1 layout: app/ui shell; notebook aggregate imports block types via public API.
      "fsd/no-ui-in-app": "off",
      "fsd/insignificant-slice": "off",
      "fsd/segments-by-purpose": "off",
      "fsd/no-reserved-folder-names": "off",
    },
  },
  // Composed Zustand root store in app/model (ui_architecture.md §4.7).
  {
    files: [
      "./src/features/**/model/**",
      "./src/pages/**/model/**",
      "./src/**/*.test.ts",
      "./src/**/*.test.tsx",
    ],
    rules: {
      "fsd/no-higher-level-imports": "off",
    },
  },
  // editor orchestrates execution via the public execution API (eslint-plugin-boundaries
  // explicitly allows features→features; steiger aligned here for the same boundary).
  {
    files: ["./src/features/editor/**", "./src/**/*.test.ts", "./src/**/*.test.tsx"],
    rules: {
      "fsd/no-cross-imports": "off",
    },
  },
  // Notebook aggregate composes block primitives (entities/notebook → entities/block public API).
  {
    files: ["./src/entities/notebook/**"],
    rules: {
      "fsd/no-cross-imports": "off",
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
]);
