# UI Docs Index

## Purpose

This index is the navigation entry point for the `ui/docs` documentation set.

Use it to quickly find:

- the canonical UI architecture
- the implementation plan
- frontend technical decisions
- unresolved design areas
- ADRs

All canonical execution documents in this folder are written in English.

## Repository Tooling

The `ui` package uses **`pnpm`** as the only package manager for this repository.

Use `pnpm` for:

- installing dependencies (`pnpm install`)
- adding or removing packages (`pnpm add`, `pnpm remove`)
- running scripts (`pnpm dev`, `pnpm test`, `pnpm build`, and other `package.json` scripts)
- one-off CLI tools (`pnpm dlx`, `pnpm exec`)

Do not use `npm`, `yarn`, or `bun` for dependency changes or script execution in `ui/`. If lockfiles from other managers exist, treat them as legacy; regenerate with `pnpm` when adopting this workflow.

**Git hooks:** [Husky](https://typicode.github.io/husky/) runs `pnpm verify:commit` on `pre-commit` (lint-staged with ESLint + Prettier on staged files, then typecheck, ESLint + Steiger on the tree, Vitest). Full-repo gate: `pnpm verify` (adds `format:check`). Installed via `pnpm prepare` after `pnpm install`. Skip once with `git commit --no-verify`.

**UI components:** Version 1 uses **[shadcn/ui](https://ui.shadcn.com/)** (Radix UI primitives + Tailwind CSS, `new-york` style). Install and update components with `pnpm dlx shadcn@latest add <component> --base radix`. Copied components live under `src/shared/ui/` per FSD. See `libs.md`, `design_tokens.md`, and `ui_architecture.md` §2.

**Component styling:** Use **Tailwind CSS only** in all UI components (`pages/*/ui/`, `features/*/ui/`, `entities/*/ui/`, `app/ui/`, `shared/ui/`).

- Apply layout, spacing, color, typography, and state visuals with Tailwind utility classes on JSX elements (`className`, including `cn()` merges from `shared/lib/utils`).
- Map product appearance through Tailwind theme tokens and CSS variables defined in `design_tokens.md`, `tailwind.config.js`, and `app/styles/` — not ad hoc per-component stylesheets.
- Prefer shadcn primitives from `shared/ui/` for controls; wrap or compose them with Tailwind classes when building feature or page views.

Do **not** use in component code:

- component-level `.css` / `.scss` files or CSS Modules imported from `ui/` components
- CSS-in-JS libraries (styled-components, Emotion, and similar)
- inline `style={{ ... }}` for static layout or theme (reserve inline styles only for rare dynamic values that Tailwind cannot express, such as measured pixel positions)

Global CSS belongs only in `app/styles/` (design tokens, shadcn theme imports, resets). See `ui_architecture.md` §4.3 and `design_tokens.md`.

**Page and feature hooks:** Each FSD slice owns behavior hooks in its own `model/` segment. Feature UI (`features/*/ui/`) calls the feature hook inside the same module (for example `LoginForm` → `useLoginForm`). Page UI (`pages/*/ui/`) calls only the page hook for route concerns (for example `LoginPage` → `useLoginPage` for authenticated redirect) and renders the feature component from the public API without duplicating feature logic.

- Destructure hook returns at the top of `*.tsx` (no `const vm = …`).
- Do not pass large prop bags from pages when the feature hook can live in `features/*/model/`.
- Import features and entities only through slice `index.ts` public APIs.
- Canonical walkthrough: `ui_architecture.md` §4.3.2 (`/login`).

```tsx
// pages/login/ui/LoginPage.tsx
import { LoginForm } from "@/features/auth";
import { useLoginPage } from "../model/useLoginPage";

export function LoginPage() {
  const { redirect } = useLoginPage();

  if (redirect) {
    return redirect;
  }

  return <LoginForm />;
}
```

When a page has no early-return guard, render the feature view directly (for example `return <NotebooksList />` when `NotebooksList` calls `useNotebooksList` internally). Full rules: `ui_architecture.md` §4.3.1 and §4.3.2.

## Read Order For Most UI Tasks

1. `ui_architecture.md`
2. `libs.md`
3. `zusthand-store.md`
4. `state_model.md`
5. `screen_specs.md`
6. `testing_strategy.md`
7. Relevant ADRs in `adr/`
8. Topic-specific documents such as `api_contracts.md`, `runtime_architecture.md`, or `notebook_schema.md`

## Current Documents

### Core Architecture

- `ui_architecture.md`
  - Canonical UI architecture for Version 1.
  - Defines routes, editor layout, block model, FSD source layout, public API rules, provider composition, internal data flows, AI scope, output types, Tailwind-only component styling, and fixed frontend decisions.

- `state_model.md`
  - High-level model of persistent, ephemeral, and derived state.
  - Maps product concerns to frontend state ownership.

- `zusthand-store.md`
  - Store-by-store definition of the Zustand model.
  - Documents store responsibilities, ownership boundaries, and cross-store interactions.

### Planning and Stack

- `libs.md`
  - Recommended frontend libraries and versions.
  - Explains why each library is selected and whether it is already installed or already fixed by architecture.

- `plan.md`
  - Recommended implementation sequence by iteration.
  - Designed for incremental delivery with mock-first frontend execution.

### Product Data and Runtime

- `notebook_schema.md`
  - Canonical notebook JSON working model for frontend planning.
  - Includes block schemas, output schemas, local metadata, and sync metadata.

- `runtime_architecture.md`
  - Frontend-side JavaScript execution model.
  - Covers worker strategy, session lifecycle, timeout, cancelation, normalization, and security boundaries.

- `api_contracts.md`
  - Draft frontend-facing API contracts for auth, notebooks, sync, and AI.
  - Includes DTO examples and unresolved items that require backend alignment.

- `sync_conflict_ux.md`
  - Explicit conflict handling UX for manual synchronization.
  - Defines user actions and required information density.

### UX and QA

- `screen_specs.md`
  - Screen-by-screen Version 1 specification for `/login`, `/notebooks`, `/help`, and `/notebooks/:notebookId`.

- `help_content.md`
  - Canonical source text for the future in-app help page.
  - Defines Version 1 help topics and user-facing copy used by the in-app help route.

- `notebook_editor_sidebar.md`
  - Notebook editor left sidebar artifact and shell behavior.
  - Defines collapse states, scroll ownership, bottom utility anchoring, and notebook item behavior.

- `design_tokens.md`
  - Design tokens and Tailwind/shadcn theme direction for notebook UI chrome.
  - Maps product tokens onto shadcn customization; see `libs.md` for component install rules.

- `testing_strategy.md`
  - Frontend-specific testing pyramid and coverage map.
  - Explains what to verify at each implementation stage.

### ADRs

- `adr/ADR-001-routing-library.md`
  - `react-router-dom` `7.8.2` and data router APIs.

- `adr/ADR-002-indexeddb-library.md`
  - `Dexie` `4.2.0` for local-first notebook persistence.

- `adr/ADR-003-runtime-execution-model.md`
  - `Web Worker` execution, session lifecycle, and `run all` reset behavior.

- `adr/ADR-004-chart-library.md`
  - `Recharts` `2.15.3` for chart outputs.

- `adr/ADR-005-test-stack.md`
  - `Vitest`, Testing Library, `MSW`, and `Playwright`.

- `adr/ADR-006-api-client-strategy.md`
  - Thin HTTP client plus `@tanstack/react-query` for server state.

- `adr/ADR-007-unsynced-changes-persistence.md`
  - Persist `hasUnsyncedChanges` in IndexedDB local metadata.

- `adr/ADR-008-block-insertion-above-below.md`
  - Block toolbar insert above and below actions.

- `adr/ADR-009-zustand-state-model.md`
  - Multi-store Zustand boundaries and reset rules.

- `adr/ADR-010-codemirror-code-editor.md`
  - CodeMirror 6 stack for JavaScript code blocks.

- `adr/ADR-011-schema-validation-zod.md`
  - `Zod` validation at API, persistence, and output boundaries.

- `adr/ADR-012-shadcn-ui.md`
  - shadcn/ui as the shared primitive layer in `shared/ui/`, installed via `pnpm dlx shadcn@latest`.

- `adr/ADR-013-fsd-source-layout.md`
  - Canonical FSD `src/` layout, public API, page/feature hooks, entity-owned types, mock constants.

- `adr/ADR-014-fsd-architecture-lint.md`
  - Steiger and `eslint-plugin-boundaries` for automated layer and slice checks (`pnpm lint`, `pnpm lint:fsd`).

## Companion Documents

Russian companions use the `RU` suffix (for example `ui_architectureRU.md`, `adr/ADR-001-routing-libraryRU.md`).

See [indexRU.md](./indexRU.md) for the full EN ↔ RU mapping table.

Rules:

- non-canonical translations for human reading
- do not use as the implementation source of truth when they conflict with English documents
- canonical execution context remains English per [requirements.md](../../docs/requirements.md)
