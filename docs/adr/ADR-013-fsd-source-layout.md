# ADR-013: FSD Source Layout

## Status

Accepted

## Context

Version 1 fixes Feature-Sliced Design (FSD) in `ui_architecture.md` §4. The repository needs a concrete `src/` layout, public API rules, and hook ownership so pages, features, entities, and the app shell stay decoupled.

Cross-cutting domain types (notebook blocks, output placeholders) are used by multiple entity slices. Strict FSD forbids direct imports between sibling `entities/*` slices.

## Decision

Organize `ui/src/` using the canonical FSD layers and segments documented in `ui_architecture.md` §4:

```text
app → pages → features → entities → shared
```

### Layer responsibilities

| Layer       | Owns                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| `app/`      | Providers, router, global layout shell, composed root store (`useAppStore`) |
| `pages/`    | Route shells; page hooks for route-only concerns (redirects, `useParams`)   |
| `features/` | User capabilities; feature hooks and UI; Zustand slice factories            |
| `entities/` | Domain shapes, pure helpers, reusable entity UI                             |
| `shared/`   | API client, persistence adapters, UI kit, cross-entity types, generic lib   |

### Public API

- Every slice under `features/`, `entities/`, `pages/`, and `shared/` exposes a public API through `index.ts`.
- External imports use slice roots only (`@/features/auth`, `@/entities/notebook`, `@/shared/ui`).
- Deep imports into `ui/`, `model/`, `api/`, or `lib/` from other slices are forbidden.

### Page and feature hooks

- **Feature hooks** (`features/*/model/use*.ts`) own capability flow: forms, lists, editor actions, store selectors.
- **Page hooks** (`pages/*/model/use*.ts`) own route concerns only: authenticated redirect, `notebookId` from `useParams`.
- Feature UI calls its feature hook internally; pages render `<FeatureView />` without duplicating feature logic or passing large prop bags.
- UI `*.tsx` files call one hook from the same slice `model/` and destructure the return value (no `vm` object in JSX).

### Entity-owned domain types

| Entity              | Types in `model/types.ts`                          |
| ------------------- | -------------------------------------------------- |
| `entities/block`    | `TextBlock`, `CodeBlock`                           |
| `entities/notebook` | `Notebook`, `NotebookBlock` (union of block types) |
| `entities/output`   | `OutputPlaceholder`                                |

Entity `lib/` and `ui/` import types from the same slice `model/types.ts` (relative) or from entity public APIs. Other layers import only through `@/entities/<slice>`.

`entities/notebook` may import `TextBlock` and `CodeBlock` from `@/entities/block` to define `NotebookBlock` (aggregate composition via public API).

### `shared/types`

Reserved for TypeScript types used by **more than one module** when they do not belong to a single entity. The folder may be empty until such a type appears. Do not move entity-owned types here for convenience.

### Composed Zustand store

- Slice **types** and **factories** (`createAuthSlice`, etc.) live in `features/*/model/`.
- `app/model/store.ts` composes slices into `useAppStore`; `app/model/index.ts` is the only public entry for the store.
- Feature and page model hooks may import `useAppStore` from `@/app/model` during incremental migration (see [ADR-014](./ADR-014-fsd-architecture-lint.md)).

### Mock and stub constants

Version 1 mock values used by feature logic (for example OTP codes) live in `features/<name>/model/constants.ts`, not in UI components.

Example: `features/auth/model/constants.ts` exports `MOCK_OTP` for `useLoginForm`.

### App shell layout

The `app/` layer uses segments `providers/`, `router/`, `ui/`, `model/`, and `styles/`. Router and layout behavior hooks sit next to their UI in `app/router/` and `app/ui/` (not in a nested `model/` segment under those folders).

## Rationale

- Matches the fixed route and capability model in `ui_architecture.md`.
- Keeps route composition thin and testable.
- Avoids entity-to-entity coupling while preserving separate `notebook`, `block`, and `output` slices.
- Makes mock-first auth and editor templates explicit and easy to replace with API adapters later.

## Consequences

### Positive

- Predictable import direction and slice boundaries for reviews and tooling.
- Clear place for new routes, features, and entity helpers.
- Mock constants are discoverable and swappable per feature.

### Negative

- `entities/notebook` → `entities/block` is an allowed cross-entity import for `NotebookBlock` composition (Steiger exception in `steiger.config.ts`).
- Composed store in `app/model` requires lint exceptions for `features`/`pages` → `app` imports until selectors are lifted or injected differently.

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §4
- [ADR-009](./ADR-009-zustand-state-model.md)
- [ADR-014](./ADR-014-fsd-architecture-lint.md)
- [index.md](../index.md)
