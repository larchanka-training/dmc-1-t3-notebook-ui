# ADR-009: Модель состояния Zustand

> Неканонический русскоязычный companion. Каноническая версия: [ADR-009-zustand-state-model.md](./ADR-009-zustand-state-model.md).

## Status

Accepted

## Decision

Несколько focused stores на `Zustand` `5.0.8`:

| Store                 | Владеет                               |
| --------------------- | ------------------------------------- |
| `authStore`           | session, login flow                   |
| `notebookListStore`   | список notebooks                      |
| `activeNotebookStore` | editable working copy                 |
| `blockUiStore`        | selection, focus, toolbars, AI prompt |
| `executionStore`      | runtime execution, outputs            |
| `syncStore`           | sync lifecycle, conflict              |
| `appUiStore`          | toasts, banners, global UI            |

Границы:

- один store не владеет и durable content, и execution outputs
- `blockUiStore` не владеет content
- `authStore` не владеет notebook content

## Consequences

- logout: reset list, active notebook, execution, sync
- switch notebook: clear block UI + execution, load new working copy
- server data — React Query ([ADR-006](./ADR-006-api-client-strategyRU.md))
