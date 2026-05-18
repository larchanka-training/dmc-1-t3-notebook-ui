# Frontend Architecture

## Purpose

This document defines the repository-specific frontend architecture for the `ui` application.

It extends:

- `ui_architecture.md`
- `../docs/project.md`
- `../docs/system_architecture.md`
- `../docs/tech_stack.md`

## Architectural Goals

The frontend architecture should:

- preserve the fixed Version 1 route model
- support local-first notebook editing
- keep notebook editing, execution, and sync concerns separated
- avoid over-centralized components or services
- allow mock-first implementation before backend integration
- remain testable at page, store, and pure logic levels

## Directory Structure

Recommended `src/` structure:

```text
src/
  app/
    App.tsx
    providers/
    router/
    styles/
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

## Directory Responsibilities

### `app/`

Contains application bootstrap concerns:

- provider composition
- router setup
- global app shell
- top-level style imports

### `pages/`

Contains route-level compositions:

- `/login`
- `/notebooks`
- `/notebooks/:notebookId`

Pages should compose features and entities, not own deep business logic.

### `features/`

Contains user-facing behavior slices:

- auth flow
- notebook creation and list interactions
- block editing
- execution controls
- sync operations
- AI-assisted block updates

Feature modules may own:

- UI components
- hooks
- action adapters
- small feature-level mappers

### `entities/`

Contains domain-level primitives and reusable views tied to core business objects:

- notebook
- block
- output
- execution session
- user session

Entities should own:

- TypeScript types
- Zod schemas
- mappers
- small reusable components centered on the entity

### `shared/`

Contains cross-cutting technical infrastructure:

- API client
- persistence adapters
- design tokens
- low-level UI primitives
- utility functions
- config and environment access

## Store Boundaries

The frontend uses multiple focused Zustand stores rather than one global store.

Recommended store boundaries:

- `authStore`
  - owns authenticated session awareness and login flow state
- `notebookListStore`
  - owns list retrieval state and list UI state
- `activeNotebookStore`
  - owns editable notebook working copy
- `blockUiStore`
  - owns per-block focus, selection, menus, and inline prompts
- `executionStore`
  - owns runtime execution state and block outputs
- `syncStore`
  - owns sync lifecycle and conflict state
- `appUiStore`
  - owns transient notifications and global UI flags

No single store should own both persisted notebook content and execution artifacts.

## Data Flow

### Editing Flow

1. The page loads the active notebook from local persistence or a mocked source.
2. The notebook is normalized into entity schemas.
3. `activeNotebookStore` becomes the source of truth for the editable working copy.
4. User edits update the active notebook state.
5. Persistence adapters save the working copy into IndexedDB.
6. `syncStore` marks the notebook as unsynced when durable sync state diverges.

### Execution Flow

1. The user triggers run actions from the block cluster or top action bar.
2. `executionStore` creates an execution request descriptor.
3. The execution orchestrator resolves block order.
4. The runtime adapter executes code in the isolated runtime.
5. Normalized outputs are stored in `executionStore`.
6. Page and block components render outputs near the originating code block.

### Sync Flow

1. The user explicitly triggers sync.
2. The sync adapter reads the editable notebook working copy and sync metadata.
3. The API client sends a sync request.
4. Success updates local sync metadata.
5. Conflict populates `syncStore` with explicit divergence state.

### AI Flow

1. The user opens AI UI for a selected code block.
2. `blockUiStore` tracks prompt visibility and draft prompt state.
3. The API client sends the AI request.
4. Returned code is staged as a proposed block update.
5. The user confirms, edits, or rejects the proposal.

## Provider Composition

Recommended provider tree:

1. `StrictMode`
2. `RouterProvider`
3. `QueryClientProvider` if `@tanstack/react-query` is adopted
4. App-level error boundary
5. App notification host

State stores remain Zustand-based and do not require React context providers.

Persistence adapters, API clients, and runtime adapters should be imported as infrastructure modules rather than context providers unless configuration variability requires injection later.

## Page, Feature, Entity, Shared Conventions

### Pages

- route-level only
- no direct IndexedDB logic
- no raw fetch logic
- compose feature entry points

### Features

- may coordinate stores
- may call API and persistence adapters
- should stay within one user-facing capability area
- should not become a second routing layer

### Entities

- define domain shape
- expose schema-safe constructors and mappers where useful
- avoid request lifecycle logic

### Shared

- generic and reusable
- no notebook business rules unless they are pure cross-cutting helpers
- safe place for:
  - `httpClient`
  - `dexieDb`
  - `runtimeAdapter`
  - date formatting helpers
  - common buttons and layout primitives

## Initial Non-Goals

The frontend architecture should not introduce in Version 1:

- a custom plugin framework
- a generic widget architecture
- a global event bus as the main coordination mechanism
- a large external UI system
- direct browser-to-LLM communication
