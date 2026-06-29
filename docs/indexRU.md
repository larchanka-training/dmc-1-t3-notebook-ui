# Индекс UI-документации

> Неканонический русскоязычный companion. Каноническая версия: [index.md](./index.md).

## Назначение

Этот индекс — точка входа в набор документации `ui/docs`.

Используйте его, чтобы быстро найти:

- каноническую UI-архитектуру
- план реализации
- frontend-технические решения
- нерешённые области дизайна
- ADR

Все канонические исполнительные документы в этой папке написаны на английском.

## Инструменты репозитория

В `ui` используется только **`pnpm`**: установка зависимостей, добавление пакетов, запуск скриптов (`pnpm dev`, `pnpm test`, …). Не использовать `npm`/`yarn` для изменений зависимостей.

UI-примитивы Version 1 — **[shadcn/ui](https://ui.shadcn.com/)**; установка через `pnpm dlx shadcn@latest …`, компоненты в `src/shared/ui/`. Канон: [index.md](./index.md#repository-tooling), [libs.md](./libs.md), [design_tokens.md](./design_tokens.md).

## Порядок чтения для большинства UI-задач

1. `ui_architecture.md` (или companion `ui_architectureRU.md`)
2. `libs.md`
3. `zusthand-store.md`
4. `state_model.md`
5. `screen_specs.md`
6. `testing_strategy.md`
7. Релевантные ADR в `adr/`
8. Тематические документы: `api_contracts.md`, `runtime_architecture.md`, `notebook_schema.md` и др.

## Текущие документы

### Базовая архитектура

| EN                   | RU companion           |
| -------------------- | ---------------------- |
| `ui_architecture.md` | `ui_architectureRU.md` |
| `state_model.md`     | `state_modelRU.md`     |
| `zusthand-store.md`  | `zusthand-storeRU.md`  |

### Планирование и стек

| EN        | RU companion |
| --------- | ------------ |
| `libs.md` | `libsRU.md`  |
| `plan.md` | `planRU.md`  |

### Данные продукта и runtime

| EN                                | RU companion                        |
| --------------------------------- | ----------------------------------- |
| `notebook_schema.md`              | `notebook_schemaRU.md`              |
| `notebook_block_layout_schema.md` | `notebook_block_layout_schemaRU.md` |
| `runtime_architecture.md`         | `runtime_architectureRU.md`         |
| `api_contracts.md`                | `api_contractsRU.md`                |
| `sync_conflict_ux.md`             | `sync_conflict_uxRU.md`             |

### UX и QA

| EN                           | RU companion                   |
| ---------------------------- | ------------------------------ |
| `screen_specs.md`            | `screen_specsRU.md`            |
| `notebook_editor_sidebar.md` | `notebook_editor_sidebarRU.md` |
| `design_tokens.md`           | `design_tokensRU.md`           |
| `page_design_scheme.md`      | `page_design_schemeRU.md`      |
| `testing_strategy.md`        | `testing_strategyRU.md`        |

### ADR

| EN                                            | RU companion                                    |
| --------------------------------------------- | ----------------------------------------------- |
| `adr/ADR-001-routing-library.md`              | `adr/ADR-001-routing-libraryRU.md`              |
| `adr/ADR-002-indexeddb-library.md`            | `adr/ADR-002-indexeddb-libraryRU.md`            |
| `adr/ADR-003-runtime-execution-model.md`      | `adr/ADR-003-runtime-execution-modelRU.md`      |
| `adr/ADR-004-chart-library.md`                | `adr/ADR-004-chart-libraryRU.md`                |
| `adr/ADR-005-test-stack.md`                   | `adr/ADR-005-test-stackRU.md`                   |
| `adr/ADR-006-api-client-strategy.md`          | `adr/ADR-006-api-client-strategyRU.md`          |
| `adr/ADR-007-unsynced-changes-persistence.md` | `adr/ADR-007-unsynced-changes-persistenceRU.md` |
| `adr/ADR-008-block-insertion-above-below.md`  | `adr/ADR-008-block-insertion-above-belowRU.md`  |
| `adr/ADR-009-zustand-state-model.md`          | `adr/ADR-009-zustand-state-modelRU.md`          |
| `adr/ADR-010-codemirror-code-editor.md`       | `adr/ADR-010-codemirror-code-editorRU.md`       |
| `adr/ADR-011-schema-validation-zod.md`        | `adr/ADR-011-schema-validation-zodRU.md`        |
| `adr/ADR-012-shadcn-ui.md`                    | —                                               |
| `adr/ADR-013-fsd-source-layout.md`            | `adr/ADR-013-fsd-source-layoutRU.md`            |
| `adr/ADR-014-fsd-architecture-lint.md`        | `adr/ADR-014-fsd-architecture-lintRU.md`        |

## Companion-документы

Все файлы с суффиксом `RU` — неканонические переводы для человеческого чтения.

Не используйте их как source of truth для реализации, если они расходятся с английскими документами.
