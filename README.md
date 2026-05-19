# JS Notebook — Frontend

Frontend application for the JavaScript-notebook product. React + TypeScript SPA.

Stack: **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v3**, **React Router v6**, **Zustand**, **Vitest + React Testing Library**.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL from Vite (usually `http://localhost:5173`), or `https://notebook.com` when running the full monorepo via Docker (see monorepo `docs/Local-Proxy.md`).

## Mock authentication

The app opens at `/login`; `/notebooks` and `/notebooks/:notebookId` are
gated and redirect to `/login` until you sign in.

To sign in (deterministic mock — **not real security**, see Scope):

1. Enter any valid-format email → **Send code** → moves to the verify step.
2. Enter the one-time code **`1234`** → redirects to `/notebooks`.
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

- `npm run dev` — development server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run preview` — preview the production build
- `npm run lint` — ESLint (`--max-warnings 0`)
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run test` — run the test suite once (Vitest)
- `npm run test:watch` — Vitest in watch mode

## Project structure

```
src/
├── app/          # application chassis: route table + layout shell
│   ├── routes.tsx       # AppLayout root; index+catch-all → /login; /notebooks* behind RequireAuth
│   ├── RequireAuth.tsx  # client-side guard: Outlet if authed else Navigate /login
│   └── AppLayout.tsx    # header + <Outlet/> shell (wraps all routes incl. /login)
├── components/   # reusable presentational components (e.g. AppHeader)
├── pages/        # one component per route (Login / NotebooksList / NotebookEditor)
├── store/        # Zustand store
│   ├── index.ts         # composed useAppStore
│   ├── types.ts         # 7 slice contracts (ui_architecture §15)
│   └── slices/          # one file per slice
└── test/         # Vitest setup (jest-dom, cleanup, store reset)
```

- `app/` = how pages are composed into the app (routing/layout), not feature logic.
- `pages/` map 1:1 to routes; `components/` are route-agnostic and reusable.
- State and routing follow `docs/ui_architecture.md` (the canonical UI spec).

## Scope

This is the **foundation/scaffold**. The login flow is wired as a deterministic
**mock** (see [Mock authentication](#mock-authentication)). Real (server-side)
authentication, code execution, IndexedDB persistence, the CodeMirror code
editor, Markdown editing, sync, and AI are delivered by later tasks — not
present here by design. Remaining forms and action buttons (e.g. Google
sign-in) are wired to named no-op stub handlers until then.

Tests run under jsdom; `src/test/setup.ts` includes a conditional Request-signal
shim so react-router data-router redirects work under Node + undici.
