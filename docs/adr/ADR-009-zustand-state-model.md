# ADR-009: Zustand State Model

## Status

Accepted

## Decision

Use multiple focused `Zustand` `5.0.8` stores instead of one global application store.

Canonical store set:

| Store                 | Owns                                               |
| --------------------- | -------------------------------------------------- |
| `authStore`           | session awareness and login flow state             |
| `notebookListStore`   | notebook collection screen state                   |
| `activeNotebookStore` | editable notebook working copy                     |
| `blockUiStore`        | selection, focus, toolbars, AI prompt visibility   |
| `executionStore`      | runtime execution lifecycle and block outputs      |
| `syncStore`           | sync lifecycle, conflict, and divergence summaries |
| `appUiStore`          | global toasts, banners, and transient UI flags     |

Hard boundaries:

- no store owns both durable notebook content and execution output artifacts
- `blockUiStore` does not own block content
- `authStore` does not own notebook content
- `syncStore` describes alignment; `activeNotebookStore` owns the editable snapshot

During incremental migration, slice stores may be composed in `app/model/`, but ownership rules above remain mandatory.

## Context

Version 1 fixes `Zustand` in `ui_architecture.md`. The product combines local editing, runtime execution, manual sync, and block-scoped AI, which cut across different lifecycles and persistence rules.

## Rationale

- separates durable editing state from ephemeral UI and runtime artifacts
- lower ceremony than Redux for the current product shape
- aligns with Feature-Sliced Design ownership by feature `model/` segments
- makes logout and notebook-switch reset rules explicit

## Consequences

- store definitions live in `state_model.md` and `zusthand-store.md`
- logout resets notebook list, active notebook, execution, and sync stores
- notebook switch clears block UI and execution session state, then loads the new working copy
- server data for lists and auth should prefer React Query (see [ADR-006](./ADR-006-api-client-strategy.md))

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §4.7, §16–17
- [ADR-013](./ADR-013-fsd-source-layout.md)
- [ADR-014](./ADR-014-fsd-architecture-lint.md)
- [state_model.md](../state_model.md)
- [zusthand-store.md](../zusthand-store.md)
