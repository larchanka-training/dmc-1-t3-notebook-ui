# JS Notebook — Frontend

Frontend application for the JavaScript-notebook product. React + TypeScript SPA.

Stack: **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v3**, **shadcn/ui**, **React Router v6**, **Zustand**, **Vitest + React Testing Library**.

Package manager: **`pnpm`** only (see [`docs/index.md`](./docs/index.md#repository-tooling)).

## Quick start

```bash
pnpm install
pnpm dev
```

Open the local URL from Vite (usually `http://localhost:5173`), or `https://notebook.com` when running the full monorepo via Docker (see monorepo `docs/Local-Proxy.md`).

## Documentation

Canonical UI specs live in [`docs/`](./docs/). Start with [`docs/index.md`](./docs/index.md) for navigation.

| Document                                               | Role                                                                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/ui_architecture.md`](./docs/ui_architecture.md) | **Canonical** Version 1 UI architecture: routes, screens, FSD layout, public API rules, Zustand model, provider composition, internal data flows, fixed technology decisions |
| [`docs/state_model.md`](./docs/state_model.md)         | Persistent, ephemeral, and derived state mapping                                                                                                                             |
| [`docs/zusthand-store.md`](./docs/zusthand-store.md)   | Store-by-store Zustand responsibilities                                                                                                                                      |
| [`docs/libs.md`](./docs/libs.md)                       | Approved libraries and versions                                                                                                                                              |
| [`docs/plan.md`](./docs/plan.md)                       | Recommended implementation sequence                                                                                                                                          |
| [`docs/screen_specs.md`](./docs/screen_specs.md)       | Screen-level Version 1 specs                                                                                                                                                 |
| [`docs/adr/`](./docs/adr/)                             | Architecture decision records                                                                                                                                                |

**Read order for most tasks:** `ui_architecture.md` → `libs.md` → `zusthand-store.md` → `state_model.md` → relevant ADRs and topic docs (`api_contracts.md`, `runtime_architecture.md`, etc.). See [`docs/index.md`](./docs/index.md).

Russian companions (`*RU.md`) are for human reading only; implementation must follow the English documents.

Agent bootstrap: [`AGENTS.md`](./AGENTS.md).

## Mock authentication

The app opens at `/login`; `/notebooks` and `/notebooks/:notebookId` are
gated and redirect to `/login` until you sign in.

To sign in (deterministic mock — **not real security**, see Scope):

1. Enter any valid-format email → **Send code** → moves to the verify step.
2. Enter the one-time code **`1234`** (`MOCK_OTP` in `features/auth/model/constants.ts`) → redirects to `/notebooks`.
3. A wrong code shows an inline error and stays on the verify step.

The "Continue with Google" button is a no-op stub. The signed-in state
(`isAuthenticated` + `userEmail`) is persisted to `localStorage` under the
key `js-notebook-auth`, so a page reload keeps you signed in; clear that key
(or browser storage) to sign out. The header shows the brand only until you
authenticate, then the `Notebooks` nav link appears.

> The `RequireAuth` guard is **client-side UX only**. Real authentication is
> a later task and must be enforced server-side — do not treat this as a
> security boundary.

## Scripts

- `pnpm dev` — development server
- `pnpm build` — typecheck (`tsc -b`) + production build
- `pnpm preview` — preview the production build
- `pnpm lint` — ESLint (FSD layer boundaries) + Steiger (`--max-warnings 0`)
- `pnpm lint:fsd` — Steiger only (`./src`)
- `pnpm typecheck` — `tsc -b --noEmit`
- `pnpm test` — run the test suite once (Vitest)
- `pnpm test:watch` — Vitest in watch mode
- `pnpm verify` — typecheck, lint (ESLint + Steiger), format check, tests (same as pre-commit hook)

Git hooks ([Husky](https://typicode.github.io/husky/)): after `pnpm install`, `pre-commit` runs `pnpm verify:commit` (lint-staged → typecheck → ESLint + Steiger → tests). Full repo check including Prettier on all files: `pnpm verify`. Skip hook once with `git commit --no-verify` if needed.

Add shadcn components: `pnpm dlx shadcn@latest add <component>` (see [`docs/libs.md`](./docs/libs.md)).

## Project structure

`src/` follows **Feature-Sliced Design (FSD)** per [`docs/ui_architecture.md`](./docs/ui_architecture.md) §4.

**Import direction (mandatory):**

```text
app → pages → features → entities → shared
```

Layers may import only from the same layer (via public API) or from layers below. No upward or cross-feature imports unless composed at `pages/`.

### Directory layout

```text
test/                 # Vitest setup and shared test utilities (outside FSD src/)
src/
  app/
    providers/
    router/
    styles/
    index.tsx
  pages/
    login/
    notebooks-list/
    notebook-editor/
  features/
    auth/
    notebooks/
    editor/
    execution/
    sync/
    ai/
  entities/
    notebook/
    block/
    output/
    session/
    user/
  shared/
    api/
    config/
    lib/
    persistence/
    ui/
    types/
```

### Slice segments

Slices under `features/`, `entities/`, and `shared/` use FSD segments where needed:

| Segment    | Typical contents                                   |
| ---------- | -------------------------------------------------- |
| `ui/`      | Components and presentational views                |
| `model/`   | Zustand slice segments, selectors, actions         |
| `api/`     | Request adapters and DTO mappers                   |
| `lib/`     | Pure helpers internal to the slice                 |
| `index.ts` | **Public API** — only entry point for other layers |

`pages/` slices are route composition only (`ui/` + `index.ts`). Import features and entities through their public APIs, not deep paths like `features/auth/ui/LoginForm`.

### Routes → slices

| Route                    | Page slice               | Main feature slices                                                     |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| `/login`                 | `pages/login/`           | `features/auth`                                                         |
| `/notebooks`             | `pages/notebooks-list/`  | `features/notebooks`, `features/auth`                                   |
| `/notebooks/:notebookId` | `pages/notebook-editor/` | `features/editor`, `features/execution`, `features/sync`, `features/ai` |

### Zustand ownership

| Store segment                         | Primary owner               |
| ------------------------------------- | --------------------------- |
| `authStore`                           | `features/auth/model/`      |
| `notebookListStore`                   | `features/notebooks/model/` |
| `activeNotebookStore`, `blockUiStore` | `features/editor/model/`    |
| `executionStore`                      | `features/execution/model/` |
| `syncStore`                           | `features/sync/model/`      |
| `appUiStore`                          | `app/` or `shared/`         |

Slice stores may be composed in `app/model/` during migration; logic stays owned by the feature above. No store segment should own both durable notebook content and execution outputs.

Full rules (layer responsibilities, provider tree, data flows): [`docs/ui_architecture.md`](./docs/ui_architecture.md) §4, §16–17.

Automated FSD checks: [`docs/adr/ADR-014-fsd-architecture-lint.md`](./docs/adr/ADR-014-fsd-architecture-lint.md) (`pnpm lint`, `pnpm lint:fsd`).

## Scope

This is the **foundation/scaffold**. The login flow is wired as a deterministic
**mock** (see [Mock authentication](#mock-authentication)). Real (server-side)
authentication, code execution, IndexedDB persistence, the CodeMirror code
editor, Markdown editing, sync, and AI are delivered by later tasks — not
present here by design. Remaining forms and action buttons (e.g. Google
sign-in) are wired to named no-op stub handlers until then.

Tests run under jsdom; `test/setup.ts` includes a conditional Request-signal
shim so react-router data-router redirects work under Node + undici.
