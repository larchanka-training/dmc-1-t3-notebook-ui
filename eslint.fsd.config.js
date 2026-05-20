import boundaries from "eslint-plugin-boundaries";

/** FSD layer boundaries for src/ — see docs/adr/ADR-014-fsd-architecture-lint.md */
const fsdElements = [
  { type: "shared", pattern: "src/shared/**", mode: "folder" },
  { type: "entities", pattern: "src/entities/*", mode: "folder" },
  { type: "features", pattern: "src/features/*", mode: "folder" },
  { type: "pages", pattern: "src/pages/*", mode: "folder" },
  { type: "app", pattern: "src/app/**", mode: "folder" },
];

/** @type {import("eslint-plugin-boundaries").BoundariesRule[]} */
const fsdDependencyRules = [
  { from: ["shared"], allow: ["shared"] },
  { from: ["entities"], allow: ["shared", "entities"] },
  { from: ["features"], allow: ["entities", "shared", "app", "features"] },
  { from: ["pages"], allow: ["features", "entities", "shared", "app", "pages"] },
  { from: ["app"], allow: ["pages", "features", "entities", "shared", "app"] },
];

export const fsdBoundariesConfig = {
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  plugins: {
    boundaries,
  },
  settings: {
    "boundaries/elements": fsdElements,
    "boundaries/include": ["src/**/*"],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        rules: fsdDependencyRules,
      },
    ],
  },
};
