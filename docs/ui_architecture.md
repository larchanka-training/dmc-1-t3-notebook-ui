# UI Architecture

## 1. Purpose

This document defines the architecture of the frontend application.

It fixes:

- the frontend routing model
- the main UI screens
- the notebook editor layout
- the block-level interaction model
- the frontend source code layout using Feature-Sliced Design (FSD)
- public API boundaries between slices
- the frontend state architecture
- the relationship between UI, local storage, execution, backend, and AI
- the fixed frontend technology decisions for Version 1

## 2. Fixed Version 1 Decisions

The following UI decisions are fixed for Version 1:

1. The application uses three routes:
   - `/login`
   - `/notebooks`
   - `/notebooks/:notebookId`
2. Frontend application state is managed with `Zustand`.
3. Text blocks are edited as `Markdown`.
4. Code blocks are edited with `CodeMirror`.
5. The notebook editor uses a vertical document layout.
6. The AI flow is block-scoped and works only in the context of a selected code block.
7. The block action cluster is shown near the block and contains:
   - block toolbar trigger
   - AI action
   - run/stop action
8. Output types are:
   - `text`
   - `object`
   - `table`
   - `chart`
   - `error`
9. Images are not a Version 1 block type.
10. Image rendering support is not part of the Version 1 UI architecture.
11. Authentication entry supports both `Email + OTP` and `Google OAuth`.
12. Shared UI primitives use **shadcn/ui** (Radix UI primitives + Tailwind), installed into `shared/ui/` with the `new-york` style and customized via project design tokens.

## 3. Frontend Role in the System

The frontend application is responsible for:

- authentication entry UI
- Google sign-in initiation UI
- notebook list UI
- notebook editor UI
- block editing
- block ordering and block-level actions
- execution controls and execution feedback
- output rendering
- AI prompt entry for a selected code block
- local persistence integration
- synchronization status and synchronization actions

The frontend owns the active working copy of the notebook during editing.

### 3.1 Architectural Goals

The frontend architecture should:

- preserve the fixed Version 1 route model
- support local-first notebook editing
- keep notebook editing, execution, and sync concerns separated
- avoid over-centralized components or services
- allow mock-first implementation before backend integration
- remain testable at page, store, and pure logic levels

### 3.2 Current Implementation Note

The target ownership model remains:

- notebook working copy belongs to notebook editing state
- execution lifecycle and runtime outputs belong to `executionStore`

During the current migration phase:

- execution lifecycle and runtime outputs are already centralized in the global Zustand execution store
- parts of notebook editing flow may still be coordinated by editor-local hooks until notebook-state consolidation is completed
- execution state must not be reintroduced into editor-local state even while notebook editing remains partially local

## 4. Source Code Layout (Feature-Sliced Design)

The frontend codebase in `ui/src/` follows **Feature-Sliced Design (FSD)**.

This section fixes the canonical FSD layer model, public API rules, and repository layout for Version 1.

### 4.1 FSD Layers

Layers are ordered from application shell to shared infrastructure:

| Layer       | Responsibility                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| `app/`      | Bootstrap, providers, router, global styles, app shell                        |
| `pages/`    | Route-level compositions for `/login`, `/notebooks`, `/notebooks/:notebookId` |
| `features/` | User-facing capabilities: auth, notebooks list, editor, execution, sync, AI   |
| `entities/` | Domain primitives: notebook, block, output, execution session, user           |
| `shared/`   | Cross-cutting infrastructure: API client, persistence, UI kit, config, lib    |

**Import direction (mandatory):**

```text
app → pages → features → entities → shared
```

- A layer may import only from the same layer (via public API) or from layers below it.
- Upward imports are forbidden (`shared` must not import from `features`, `entities` must not import from `pages`, and so on).
- Cross-imports between sibling slices on the same layer are forbidden unless explicitly allowed below.

### 4.2 Directory Structure

Canonical `src/` layout:

```text
src/
  app/
    model/
    providers/
    router/
    ui/
    styles/
    index.tsx
  pages/
    login/
      ui/
      model/
    notebooks-list/
      ui/
      model/
    notebook-editor/
      ui/
      model/
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

### 4.3 Slice Internal Segments

Each slice under `features/`, `entities/`, `pages/`, or `shared/` uses standard FSD segments where needed:

| Segment    | Typical contents                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/`      | Components (`*.tsx`): JSX only — import a hook from the **same slice** `model/` and destructure at the top, or accept props when the parent composes data |
| `model/`   | Zustand slice segments, selectors, actions, and behavior hooks (`use<FeatureName>.ts`, `use<PageName>.ts`)                                                |
| `api/`     | Request adapters and DTO mappers for that slice                                                                                                           |
| `lib/`     | Pure helpers used only inside the slice                                                                                                                   |
| `index.ts` | **Public API** of the slice                                                                                                                               |

`pages/` slices use `ui/` for route views and `model/` for their behavior hooks (`ui/` + `model/` + `index.ts` for most pages).

`app/` does not use a public `index.ts` for product slices; it is the composition root.

### 4.3.1 UI Component and Hook Separation

Every UI component with behavior (local state, effects, store/router usage, or non-trivial event handlers) must split **logic** and **markup** inside the **same FSD slice**:

| File                                                       | Responsibility                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `model/use<Name>.ts` (or `.tsx` when the hook returns JSX) | Hook: state, selectors, handlers, navigation, derived values, optional early-return nodes for **that slice only** |
| `ui/<Name>.tsx`                                            | Component: import the hook from `../model/` in the **same slice**, destructure at the top, render JSX only        |

**Required in `*.tsx`:**

- import the hook from `../model/use<Name>` (same slice only)
- call the hook once at the top of the component
- destructure the hook return (do not use a single `vm` object in JSX)
- return JSX (and at most one route-level guard such as `if (redirect) return redirect` on pages)

**Forbidden in `*.tsx`:**

- `useState`, `useReducer`, `useEffect`, `useMemo`, `useCallback`, `useRef` (except refs forwarded to DOM in rare presentational cases)
- direct `useAppStore`, `useQuery`, or other data hooks
- `useNavigate`, `useParams`, and other router hooks
- handler function definitions (`handleSubmit`, `onClick` bodies with business rules, and similar)
- module-level constants used only for behavior (mock OTP codes, feature flags, and similar)

Put those in the slice `model/` hook (or in a Zustand segment in `features/*/model/` when the state is shared app state).

**Forbidden example:** a single file that mixes `useState`, store selectors, handlers, and the full JSX tree (the pre-refactor monolithic `LoginPage`).

Pure presentational subcomponents (props in, JSX out, no hooks) do not require a separate hook file. When a subcomponent gains behavior, extract `model/use<SubComponentName>.ts` in the same slice.

Hook unit tests are optional; page and feature integration tests may keep targeting the public component export.

### 4.3.2 Page and Feature Hooks (Reference: `/login`)

Capability logic lives in **`features/<name>/model/`** and is consumed by **`features/<name>/ui/`** through a feature-local hook. Route shells live in **`pages/<route>/`** and use a **page hook** only for concerns that belong to the route, not to the feature.

Do **not** put feature flow state (forms, OTP steps, verify handlers) in `pages/*/model/`. Do **not** pass a large props bag from the page into the feature when the feature can call its own hook.

#### Responsibility split

| Concern                                                                                   | Owner                                                         | Example (`/login`)                              |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| Email OTP UI, step machine, verify/resend handlers, post-login navigation to `/notebooks` | `features/auth`                                               | `useLoginForm` + `LoginForm`                    |
| Durable auth session (`isAuthenticated`, `userEmail`)                                     | `features/auth/model/` (`authSlice` composed in `app/model/`) | `setAuthenticated` after successful OTP         |
| Redirect already-authenticated users away from `/login`                                   | `pages/login`                                                 | `useLoginPage` → `<Navigate to="/notebooks" />` |
| Block unauthenticated access to `/notebooks` routes                                       | `app/router/`                                                 | `RequireAuth` + `useRequireAuth`                |
| Route table                                                                               | `app/router/`                                                 | `routes.tsx` mounts `LoginPage` at `/login`     |

#### File layout (canonical)

```text
features/auth/
  model/
    authSlice.ts       # Zustand segment (session fields, setAuthenticated, logout)
    useLoginForm.ts    # feature hook — OTP flow, local step state (slice-internal)
  ui/
    LoginForm.tsx      # calls useLoginForm(), renders sign-in markup
  index.ts             # public API: LoginForm (and store slice factory for app/)

pages/login/
  model/
    useLoginPage.tsx   # page hook — authenticated redirect only
  ui/
    LoginPage.tsx      # guard + <LoginForm /> from @/features/auth
  index.ts             # public API: LoginPage
```

`useLoginForm` stays **slice-internal** (relative import from `LoginForm.tsx` only). Export through `features/auth/index.ts` only when another layer must call the hook directly; the default is to export the feature UI component and keep the hook private.

#### Data flow

```text
User → LoginPage
         ├─ useLoginPage()     → if auth.isAuthenticated → <Navigate />
         └─ <LoginForm />
              └─ useLoginForm()
                   ├─ local: step, email, otp, error
                   ├─ on success: setAuthenticated() (authSlice)
                   └─ navigate("/notebooks")
```

`RequireAuth` on `/notebooks` routes mirrors the login redirect: unauthenticated users are sent back to `/login`.

#### Page shell (route-only hook)

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

```tsx
// pages/login/model/useLoginPage.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/app/model";

export function useLoginPage() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);

  const redirect: ReactNode | null = isAuthenticated ? (
    <Navigate to="/notebooks" replace />
  ) : null;

  return { redirect };
}
```

#### Feature module (hook inside the feature)

```tsx
// features/auth/ui/LoginForm.tsx
import { Button } from "@/shared/ui";
import { useLoginForm } from "../model/useLoginForm";

export function LoginForm() {
  const {
    step,
    email,
    otp,
    error,
    onRequestOtp,
    onVerifyOtp,
    onChangeEmail,
    onResendCode,
    onGoogleSignIn,
    onEmailChange,
    onOtpChange
  } = useLoginForm();

  return (
    // ...sign-in JSX driven by step, handlers, and field values
  );
}
```

```ts
// features/auth/model/useLoginForm.ts
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/app/model";

export function useLoginForm() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  // handlers: request OTP → verify → setAuthenticated + navigate
  // stubs: Google sign-in, resend (mock-first)

  return { step, email, otp, error, onRequestOtp, onVerifyOtp /* ... */ };
}
```

#### Mock-first behavior (Version 1)

- **Request OTP:** advances `step` to `"verify"` without a network call.
- **Verify OTP:** accepts mock code `1234`, calls `setAuthenticated(true, email)`, navigates to `/notebooks`.
- **Google sign-in:** intentional no-op stub until OAuth is integrated.
- **Resend code:** no-op stub on the verify step.

Replace mock constants and stubs with `features/auth/api/` adapters when backend contracts from `api_contracts.md` are wired; keep the hook and `LoginForm` shape stable.

#### Apply the same pattern on other routes

| Route                    | Page hook (`pages/*/model/`)                       | Feature hook (`features/*/model/`)    | Feature UI           |
| ------------------------ | -------------------------------------------------- | ------------------------------------- | -------------------- |
| `/login`                 | `useLoginPage` — auth redirect                     | `useLoginForm` — sign-in flow         | `LoginForm`          |
| `/notebooks`             | optional route guards later                        | `useNotebooksList` — list + create    | `NotebooksList`      |
| `/notebooks/:notebookId` | `useNotebookEditorPage` — params/load errors later | `useNotebookEditor` — blocks, outputs | `NotebookEditorView` |

When a feature UI is self-contained, the page renders `<FeatureView />` with **no props**. When the page must inject route-derived data (for example `notebookId` from `useParams`), the page hook may pass **narrow** props into the feature public API — not duplicate feature logic in the page hook.

### 4.4 Layer Responsibilities

#### `app/`

- provider composition (see §4.9)
- route table and guards
- global layout shell and style entrypoints
- optional composition of the root Zustand store from feature/entity `model/` segments during migration

#### `pages/`

- one folder per route
- compose feature and entity entry points
- no direct IndexedDB access, no raw `fetch`, no deep domain rules

#### `features/`

- auth flow (email OTP, Google entry, session awareness UI)
- notebook list interactions (create, open)
- editor interactions (block CRUD, reorder, toolbar)
- execution controls (run block / all / from here, stop)
- sync operations (explicit sync, conflict UX entry points)
- AI-assisted block updates (block-scoped prompt and apply flow)

Feature slices may own UI components, hooks, action adapters, and small feature-level mappers. They may coordinate stores and call API or persistence adapters, but must stay within one user-facing capability area and must not become a second routing layer.

#### `entities/`

- notebook, block, output, session, and user shapes
- Zod schemas, types, mappers
- small reusable entity-centric UI (for example `BlockCard`, `OutputView`) without feature orchestration

Entities define domain shape and expose schema-safe constructors and mappers where useful. They must not own request lifecycle logic.

#### `shared/`

- `api/httpClient` and transport helpers
- `persistence/` adapters (IndexedDB/Dexie)
- design tokens and low-level UI primitives
- shadcn/ui components (buttons, inputs, dialogs, and similar primitives) under `shared/ui/`
- environment config and generic utilities

`shared/` is generic and reusable. It must not contain notebook business rules except pure cross-cutting helpers. Typical infrastructure modules include `httpClient`, `dexieDb`, and `runtimeAdapter`.

### 4.5 Public API Rules

Every slice exposes a **public API** through `index.ts` at the slice root.

**Allowed imports from outside the slice:**

```ts
import { LoginForm } from "@/features/auth";
import { NotebookBlock } from "@/entities/block";
import { httpClient } from "@/shared/api";
```

**Forbidden imports from outside the slice:**

```ts
import { LoginForm } from "@/features/auth/ui/LoginForm";
import { mapNotebookDto } from "@/entities/notebook/lib/mapNotebookDto";
```

Rules:

1. External code imports only from the slice public API path (`features/auth`, `entities/notebook`, `shared/api`, etc.).
2. Deep imports into `ui/`, `model/`, `api/`, or `lib/` from another slice or from `pages/` are not allowed.
3. Inside a slice, use relative imports between segments freely.
4. `pages/` import features and entities only through their public APIs.
5. `app/` imports `pages/` through page public APIs and wires infrastructure from `shared/`.
6. Re-export only symbols that parent layers are expected to use; keep internals private by omitting them from `index.ts`.

**What belongs in a public API:**

| Layer        | Export through `index.ts`                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| `features/*` | Screen-section components, hooks, and actions/coordinators intended for `pages/`  |
| `entities/*` | Types, schemas, mappers, and reusable entity UI building blocks                   |
| `shared/*`   | Stable infrastructure facades (`httpClient`, persistence adapters, UI primitives) |
| `pages/*`    | Default page component for the route                                              |

**What must not be exported:**

- slice-internal helpers unless another layer truly needs them (prefer moving shared logic down to `entities/` or `shared/`)
- store implementation details when a selector hook is the intended contract
- test-only utilities

### 4.6 Allowed Cross-Slice Dependencies

Default: **no** direct imports between sibling `features/*` slices.

If coordination is required:

- lift shared types or pure logic to `entities/` or `shared/lib/`
- compose both features at `pages/` level
- pass callbacks/data from the page instead of importing another feature's internals

`entities/` may depend only on `shared/`. `features/` may depend on `entities/` and `shared/`.

### 4.7 State Ownership in FSD

Zustand state segments align with product boundaries:

| Store segment                         | Primary owner                                  |
| ------------------------------------- | ---------------------------------------------- |
| `authStore`                           | `features/auth/model/`                         |
| `notebookListStore`                   | `features/notebooks/model/`                    |
| `activeNotebookStore`, `blockUiStore` | `features/editor/model/`                       |
| `executionStore`                      | `features/execution/model/`                    |
| `syncStore`                           | `features/sync/model/`                         |
| `appUiStore`                          | `app/` or `shared/` (transient global UI only) |

The application may compose slice stores in `app/model/` (single `useAppStore` with slices) during incremental migration, but each segment's logic and selectors remain owned by the feature listed above and are re-exported through that feature's public API when needed by `pages/`.

No store segment should own both durable notebook content and execution output artifacts.

### 4.8 Mapping Routes to Slices

| Route                    | Page slice               | Main feature slices                                                     |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| `/login`                 | `pages/login/`           | `features/auth`                                                         |
| `/notebooks`             | `pages/notebooks-list/`  | `features/notebooks`, `features/auth`                                   |
| `/notebooks/:notebookId` | `pages/notebook-editor/` | `features/editor`, `features/execution`, `features/sync`, `features/ai` |

### 4.9 Provider Composition

Recommended provider tree in `app/`:

1. `StrictMode`
2. `QueryClientProvider` (`@tanstack/react-query` — configured in `app/providers/`)
3. `RouterProvider` (in `app/router/AppRouter.tsx`)
4. App-level error boundary (`app/ui/AppErrorBoundary.tsx`)
5. App notification host (`app/ui/AppToastHost.tsx`)

Zustand stores do not require React context providers.

Persistence adapters, API clients, and runtime adapters should be imported as infrastructure modules from `shared/` rather than exposed through context providers, unless configuration variability requires injection later.

### 4.10 Architecture Lint

FSD layout and import rules in this section are enforced in CI and local verification:

| Tool                                       | Config                 | Command                                       |
| ------------------------------------------ | ---------------------- | --------------------------------------------- |
| ESLint + `eslint-plugin-boundaries`        | `eslint.fsd.config.js` | `pnpm lint` (first stage)                     |
| Steiger + `@feature-sliced/steiger-plugin` | `steiger.config.ts`    | `pnpm lint` (second stage) or `pnpm lint:fsd` |

See [ADR-013](./adr/ADR-013-fsd-source-layout.md) for the canonical source layout (entity-owned types, `shared/types/` only for cross-module types, `features/*/model/constants.ts`) and [ADR-014](./adr/ADR-014-fsd-architecture-lint.md) for lint configuration and exceptions (composed store in `app/model/`).

## 5. Routing Model

The frontend routing model is:

### 5.1 `/login`

Purpose:

- collect user email
- collect OTP
- initiate Google sign-in
- transition the user into authenticated state

### 5.2 `/notebooks`

Purpose:

- show the list of notebooks available to the user
- create a notebook
- open a notebook

### 5.3 `/notebooks/:notebookId`

Purpose:

- open the notebook editor
- load the active notebook working copy
- edit blocks
- run notebook code
- perform sync
- use AI for block-level code updates

## 6. Screen Structure

### 6.1 Login Screen

Implementation follows §4.3.2: `pages/login` (route redirect) + `features/auth` (`LoginForm` / `useLoginForm` / `authSlice`).

The login screen contains:

- email input
- submit action for OTP request
- OTP input
- submit action for OTP verification
- Google sign-in action
- request status feedback
- authentication error feedback

### 6.2 Notebook List Screen

The notebook list screen contains:

- page header
- create notebook action
- notebook list
- notebook list item actions as needed
- loading state
- empty state
- error state

### 6.3 Notebook Editor Screen

The notebook editor screen contains:

- top notebook action bar
- central vertical block list
- block-level action cluster beside each block
- block content area
- block output area for executable blocks
- sync state indicator

The notebook editor screen does not include a global AI workspace in Version 1.

## 7. Notebook Editor Layout

The notebook editor uses a `notion-like` vertical reading and editing flow.

The layout structure is:

1. top action bar
2. notebook metadata area where needed
3. ordered vertical block sequence
4. block-local output directly attached to the related code block

The top action bar contains notebook-level actions such as:

- notebook title display or editing
- sync action
- run-all action
- export action
- navigation actions where needed

The layout does not use a permanent split-view or a permanent global side panel in Version 1.

## 8. Block Model in the UI

The frontend supports two block types:

- `text`
- `code`

Each rendered block contains:

- block container
- block action cluster
- block content area
- block-specific UI state

Code blocks additionally contain:

- code editor
- run/stop control
- AI action
- output area

Text blocks contain:

- Markdown editing area

## 9. Block Action Cluster

Each block displays a block action cluster near the block.

The cluster contains:

1. `Block toolbar trigger`
   Opens block actions such as:
   - add block above
   - add block below
   - delete block
   - move block up
   - move block down

2. `AI action`
   Opens AI prompt UI for the selected code block.

3. `Run/Stop action`
   Starts execution or stops the running block execution flow when applicable.

The action cluster is local to the block and is not a notebook-global control area.

## 10. Text Block Editing

Text blocks are edited as `Markdown`.

Version 1 text editing uses a Markdown-oriented editing surface.

The text block UI supports:

- plain text entry
- Markdown syntax entry
- normal text block editing operations

Version 1 does not include a rich text editor.

## 11. Code Block Editing

Code blocks are edited with `CodeMirror`.

The code block UI supports:

- editing executable `JavaScript`
- preserving code content as part of the notebook block
- block-level execution actions
- AI-assisted code replacement or refinement

The code editor is part of the block and not a detached IDE workspace.

## 12. Output Rendering

Output is rendered in the context of the code block that produced it.

Supported output types in Version 1 are:

- `text`
- `object`
- `table`
- `chart`
- `error`

Output is shown directly below or beside the relevant code block content area inside the block context.

Output is not modeled as a standalone notebook block type.

## 13. AI User Flow

The AI flow is block-scoped.

The frontend AI interaction model is:

1. The user selects a target code block.
2. The user clicks the block AI action.
3. The frontend opens a prompt input UI for that block.
4. The user enters a prompt.
5. The frontend sends the prompt and relevant notebook context through the backend AI endpoint.
6. The frontend receives generated code.
7. The frontend inserts the generated code into the selected code block as a proposed update.
8. The user confirms, edits, or replaces the inserted code.

Version 1 does not include:

- a global AI editor
- a separate AI chat page
- notebook-wide detached AI authoring workflow

## 14. Execution User Flow

The frontend supports these execution actions:

- run current block
- stop current running execution flow when applicable
- run all blocks
- run from selected block

The execution UI is responsible for:

- dispatching execution commands to the execution orchestrator
- showing running state
- showing success or error results
- binding outputs to the correct block

The execution UI uses block-level and notebook-level controls, not a detached console-first workflow.

## 15. Local Persistence and Sync UX

The frontend integrates local persistence and explicit synchronization.

The UI responsibilities are:

- keep the active notebook working copy locally persisted
- mark the notebook when unsynced changes exist
- allow explicit user-triggered sync
- show sync status
- show sync conflict state explicitly if returned by the backend

Version 1 does not hide synchronization behind a silent always-on merge model.

## 16. Frontend State Architecture

Frontend application state is managed with `Zustand`.

The frontend state is divided into the following logical areas:

### 16.1 Auth State

Contains:

- authentication status
- current user session awareness
- login flow state
- OTP flow UI state
- Google sign-in flow state

### 16.2 Notebook List State

Contains:

- notebook list data
- notebook list loading state
- notebook list error state

### 16.3 Active Notebook State

Contains:

- active notebook identity
- notebook metadata
- ordered blocks
- local working copy state
- dirty or unsynced markers

### 16.4 Block UI State

Contains:

- selected block
- focused block
- block toolbar visibility
- block-local editing UI state
- AI prompt visibility for a block

### 16.5 Execution State

Contains:

- current execution status
- current execution target
- running block markers
- execution error state
- block output bindings

### 16.6 Sync State

Contains:

- last synchronized state markers
- sync in-progress state
- sync success state
- sync conflict state
- sync error state

### 16.7 App UI State

Contains:

- global loading indicators where needed
- transient notifications
- page-level UI state

## 17. Data Flow Boundaries

The frontend communicates with the following system parts:

### 17.1 Backend API

Used for:

- authentication
- notebook list loading
- notebook retrieval
- notebook synchronization
- AI requests

### 17.2 Local Storage

Used for:

- local notebook working copy persistence
- reload recovery
- local sync metadata

### 17.3 Execution Orchestrator

Used for:

- run block
- run from block
- run all
- stop execution

### 17.4 Execution Runtime

Used indirectly through the execution orchestrator for:

- isolated `JavaScript` execution
- output production
- execution session state

### 17.5 Editing Flow

1. The page loads the active notebook from local persistence or a mocked source.
2. The notebook is normalized into entity schemas.
3. `activeNotebookStore` becomes the source of truth for the editable working copy.
4. User edits update the active notebook state.
5. Persistence adapters save the working copy into IndexedDB.
6. `syncStore` marks the notebook as unsynced when durable sync state diverges.

### 17.6 Execution Flow

1. The user triggers run actions from the block cluster or top action bar.
2. `executionStore` creates an execution request descriptor.
3. The execution orchestrator resolves block order.
4. The runtime adapter executes code in the isolated runtime.
5. Normalized outputs are stored in `executionStore`.
6. Page and block components render outputs near the originating code block.

### 17.7 Sync Flow

1. The user explicitly triggers sync.
2. The sync adapter reads the editable notebook working copy and sync metadata.
3. The API client sends a sync request.
4. Success updates local sync metadata.
5. Conflict populates `syncStore` with explicit divergence state.

### 17.8 AI Flow

1. The user opens AI UI for a selected code block.
2. `blockUiStore` tracks prompt visibility and draft prompt state.
3. The API client sends the AI request.
4. Returned code is staged as a proposed block update.
5. The user confirms, edits, or rejects the proposal.

## 18. Error and Empty States

The frontend must explicitly render:

- login error state
- notebook list empty state
- notebook list error state
- notebook load error state
- block execution error state
- sync error state
- sync conflict state
- AI request error state

These states are part of the architecture and not optional visual polish.

## 19. Version 1 Out-of-Scope UI Features

The following UI features are outside Version 1:

- rich text editor
- image block type
- image rendering inside blocks
- global AI workspace
- real-time collaborative editing UI
- inline review comment system
- multi-pane IDE-like workspace

The frontend architecture must not introduce in Version 1:

- a custom plugin framework
- a generic widget architecture
- a global event bus as the main coordination mechanism
- full-stack UI frameworks such as MUI, Chakra UI, or Ant Design (shadcn/ui is the chosen primitive layer)
- direct browser-to-LLM communication

## 20. Related Documents

- [adr/ADR-013-fsd-source-layout.md](./adr/ADR-013-fsd-source-layout.md)
- [adr/ADR-014-fsd-architecture-lint.md](./adr/ADR-014-fsd-architecture-lint.md)
- [system_architecture.md](../../docs/system_architecture.md)
- [tech_stack.md](../../docs/tech_stack.md)
- [project.md](../../docs/project.md)
