# Frontend Libraries

## Purpose

This document fixes the recommended frontend libraries for Version 1 implementation planning.

It distinguishes:

- libraries already installed in the repository
- libraries already fixed by architecture documents
- libraries recommended to add next
- libraries intentionally not used in the first implementation stage

## Package Manager

Use **`pnpm`** only in the `ui` repository:

- `pnpm install` — install dependencies
- `pnpm add <pkg>` / `pnpm remove <pkg>` — change dependencies
- `pnpm run <script>` or `pnpm <script>` — run `package.json` scripts
- `pnpm dlx <cli>` — run CLIs such as the shadcn initializer without a global install

Do not use `npm` or `yarn` for installs or lockfile updates in `ui/`.

## Decision Status Markers

- `Already installed` means the package is present in `package.json`.
- `Architecturally fixed` means the project documentation already mandates the capability or tool choice.
- `Recommended to add` means the package is not yet installed but should be adopted for Version 1.
- `Not for stage 1` means the package or category should be deferred.

## Radix Primitives (shadcn)

### `@radix-ui/react-slot`

- Status: `Already installed`
- Reason:
  - required by the canonical shadcn `Button` (`new-york` style)
  - additional Radix packages are added per component via `pnpm dlx shadcn@latest add <component> --base radix`

## Current Installed Foundation

### `react` `18.3.1`

- Status: `Already installed`
- Reason:
  - fixed framework direction for the frontend
  - aligns with the project-level stack in `../docs/tech_stack.md`
  - sufficient for the current V1 scope

### `react-dom` `18.3.1`

- Status: `Already installed`
- Reason:
  - required React browser rendering package
  - already present in the starter repository

### `typescript` `5.6.3`

- Status: `Already installed`
- Reason:
  - project-level frontend language is already fixed as `TypeScript`
  - strong typing is required for notebook schemas, outputs, and state boundaries

### `vite` `8.0.13`

- Status: `Already installed`
- Reason:
  - project-level frontend build tool is already fixed as `Vite`
  - supports fast iteration and Vitest integration

### `@vitejs/plugin-react` `6.0.2`

- Status: `Already installed`
- Reason:
  - standard React integration for Vite

### `eslint` `9.13.0`

- Status: `Already installed`
- Reason:
  - baseline linting already exists in the repository
  - should remain part of the default verification chain
  - merged with FSD layer rules via `eslint-plugin-boundaries` (see [ADR-014](./adr/ADR-014-fsd-architecture-lint.md))

### `eslint-plugin-boundaries` `6.0.2`

- Status: `Already installed`
- Reason:
  - enforces FSD layer import direction in ESLint (`ui/eslint.fsd.config.js`)
  - runs as part of `pnpm lint`
- Explicit note:
  - see [ADR-014](./adr/ADR-014-fsd-architecture-lint.md)

### `steiger` `0.5.12` and `@feature-sliced/steiger-plugin` `0.5.8`

- Status: `Already installed`
- Reason:
  - official FSD file-structure and slice-import linter for `ui/src/`
  - configured in `ui/steiger.config.ts`
  - runs after ESLint in `pnpm lint`; alone via `pnpm lint:fsd`
- Explicit note:
  - see [ADR-013](./adr/ADR-013-fsd-source-layout.md) and [ADR-014](./adr/ADR-014-fsd-architecture-lint.md)

## Application Libraries

### `react-router-dom` `7.8.2`

- Status: `Already installed`
- Reason:
  - the route model is already fixed in `ui_architecture.md`
  - the application has exactly three product routes and benefits from a standard router
  - stable fit for page-level loading, error, and redirect handling
- Explicit note:
  - the route model itself is `Architecturally fixed`

### `zustand` `5.0.8`

- Status: `Already installed`
- Reason:
  - state management with `Zustand` is `Architecturally fixed` in `ui_architecture.md`
  - well suited for separating active notebook state, execution state, sync state, and ephemeral UI state
  - lower ceremony than Redux for this product shape
- Explicit note:
  - required by architecture

### `dexie` `4.2.0`

- Status: `Already installed`
- Reason:
  - `IndexedDB` is a core product behavior, not just a cache
  - Dexie provides safer and more maintainable browser persistence than raw IndexedDB APIs
  - fits the local-first editing model and sync metadata storage

### `zod` `4.1.5`

- Status: `Already installed`
- Reason:
  - the product depends on structured notebook JSON, output normalization, and sync payloads
  - runtime validation is useful at API boundaries, persistence boundaries, and migration boundaries
  - keeps frontend assumptions explicit instead of implicit

### `@tanstack/react-query` `5.87.1`

- Status: `Already installed`
- Reason:
  - useful for server state such as auth session, notebook lists, notebook fetches, sync mutations, and AI requests
  - should not own editor state or execution state
  - reduces ad hoc request lifecycle code
- Explicit note:
  - this library is optional in the sense that the product can start without it
  - it is still recommended early because the app has clear backend request boundaries

## UI Component System

### `shadcn/ui` (Radix UI + Tailwind)

- Status: `Architecturally fixed`
- Reason:
  - Version 1 uses shadcn/ui for buttons, inputs, dialogs, menus, and other shared UI primitives
  - generated components use **Radix UI** (for example `@radix-ui/react-slot` on `Button`) with the `new-york` style (see `components.json`)
  - components are copied into the repo (not an opaque runtime dependency tree like MUI or Ant Design)
  - aligns with Tailwind CSS and the FSD `shared/ui/` layer in `ui_architecture.md`
- Install and update:
  - initialize once: `pnpm dlx shadcn@latest init` (from the `ui/` directory; follow CLI prompts)
  - add a component: `pnpm dlx shadcn@latest add <component>`
  - place generated files under `src/shared/ui/` and export through the slice public API
- Explicit note:
  - customize appearance via `design_tokens.md` and Tailwind theme variables, not ad hoc one-off styles in feature slices
  - notebook-specific surfaces (blocks, editor chrome, outputs) may wrap shadcn primitives in `entities/` or `features/` `ui/` segments

## Editor And Content Libraries

### `@uiw/react-codemirror` `4.25.1`

- Status: `Already installed`
- Reason:
  - `CodeMirror` for code blocks is `Architecturally fixed` in `ui_architecture.md`
  - this wrapper provides a practical React integration on top of CodeMirror 6
  - allows a staged implementation without building a custom bridge first

### `@codemirror/state` `6.5.2`

- Status: `Already installed`
- Reason:
  - useful as an explicit pinned foundation around the CodeMirror integration
  - helps avoid hidden transitive assumptions if editor customization grows

### `@codemirror/view` `6.x`

- Status: `Already installed`
- Reason:
  - explicit editor view dependency for future editor extensions, keyboard handling, and decorations
- Explicit note:
  - exact minor version should match the chosen CodeMirror package set during installation

### `@codemirror/lang-javascript` `6.x`

- Status: `Already installed`
- Reason:
  - Version 1 is `JavaScript first`
  - required for code block language support

### `react-markdown`

- Status: `Not for stage 1`
- Reason:
  - text blocks are edited as `Markdown`, but stage 1 can start with a plain Markdown editing surface and simple preview rules
  - do not add a renderer before the notebook editing and persistence flows are stable
- Explicit note:
  - Markdown itself is `Architecturally fixed`
  - the rendering library is not yet fixed

## Charts And Data Presentation

### `recharts` `2.15.3`

- Status: `Already installed`
- Reason:
  - charts are a required output type in Version 1
  - Recharts is sufficient for simple notebook-friendly chart rendering
  - easier to ship than a heavier charting stack
- Explicit note:
  - exact version should be pinned when the chart output shape is finalized in the related ADR

## Testing Libraries

### `vitest` `4.1.6`

- Status: `Already installed`
- Reason:
  - natural fit with Vite
  - supports fast unit and UI integration testing

### `@testing-library/react` `16.3.0`

- Status: `Already installed`
- Reason:
  - appropriate for screen and component behavior tests
  - works well with routed pages and Zustand-backed UI

### `@testing-library/user-event`

- Status: `Already installed`
- Reason:
  - needed for realistic keyboard and pointer interactions in editor and block toolbar tests

### `msw` `2.11.1`

- Status: `Already installed`
- Reason:
  - supports API contract-oriented frontend tests without coupling tests to a real backend
  - useful both for unit-level async tests and browser-like integration tests

### `@playwright/test` `1.54.2`

- Status: `Already installed`
- Reason:
  - the project already expects a smoke E2E layer
  - required for route-level and offline-first verification in a real browser

## Not Used In Stage 1

### Full-stack UI frameworks (not shadcn)

- `MUI`
- `Chakra UI`
- `Ant Design`

Reason:

- Version 1 standardizes on shadcn/ui copied into `shared/ui/`
- these frameworks introduce a separate styling and composition model that conflicts with the documented Tailwind + token direction

### Rich text editors

- `TipTap`
- `Lexical`

Reason:

- Version 1 text blocks are Markdown-oriented
- rich text editing would increase complexity before core notebook flows are stable

### Global state alternatives

- `Redux Toolkit`
- `MobX`

Reason:

- `Zustand` is already the architectural decision

### Drag-and-drop frameworks

- `dnd-kit`
- `react-beautiful-dnd`

Reason:

- stage 1 block ordering can be implemented with deterministic move up and move down actions
- drag-and-drop can be reconsidered later

### Form frameworks

- `react-hook-form`
- `formik`

Reason:

- stage 1 has limited forms and can be handled with local state

## Version Sources

The current recommended versions above were checked against npm package pages on `2026-05-18`:

- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [zustand](https://www.npmjs.com/package/zustand)
- [dexie](https://www.npmjs.com/package/dexie)
- [zod](https://www.npmjs.com/package/zod)
- [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query)
- [@uiw/react-codemirror](https://www.npmjs.com/package/@uiw/react-codemirror)
- [vitest](https://www.npmjs.com/package/vitest)
- [@testing-library/react](https://www.npmjs.com/package/@testing-library/react)
- [msw](https://www.npmjs.com/package/msw)
- [@playwright/test](https://www.npmjs.com/package/@playwright/test)
