# План реализации frontend

> Неканонический русскоязычный companion. Каноническая версия: [plan.md](./plan.md).

## Назначение

Рекомендуемая последовательность реализации frontend.

План **mock-first**:

1. UI structure и local behaviors
2. local persistence и runtime execution
3. подключение real backend API

## Принципы

- небольшие вертикальные срезы
- каждая итерация shippable где возможно
- локальное детерминированное поведение до backend
- verification вместе с behavior

## Итерация 0: Документация и foundation

**Цель:** снять неоднозначность.

**Deliverables:** stack в docs, screen specs, store model, notebook schema draft, API contract draft, ADR.

**Verification:** document review, alignment с `ui_architecture.md`.

## Итерация 1: App shell и routing

**Deliverables:** route shell, providers, page skeletons, baseline styles/tokens, error boundary.

**Verification:** lint, typecheck, route rendering tests.

## Итерация 2: Mock screens и UI states

**Deliverables:** login (OTP + Google states), list (loading/empty/error/success), editor shell.

**Verification:** UI integration per state, Playwright route smoke.

## Итерация 3: Notebook domain и Zustand

**Deliverables:** schemas, stores, block CRUD/move, text/code editing shell.

**Verification:** unit transforms, UI block operations.

## Итерация 4: Local persistence (IndexedDB)

**Deliverables:** Dexie, working copy persistence, reload recovery, sync metadata.

**Verification:** persistence unit tests, restore integration tests.

## Итерация 5: Execution runtime MVP

**Deliverables:** orchestrator, worker adapter, run block/all/from, outputs text/object/table/error.

**Verification:** orchestration unit tests, output binding integration, negative runtime cases.

## Итерация 6: AI mock flow

**Deliverables:** block-scoped AI prompt UI, proposed code insertion, confirm/edit/reject.

**Verification:** prompt lifecycle UI tests, Playwright editor smoke.

## Итерация 7: Sync mock flow

**Deliverables:** sync button/statuses, mock success/error/conflict UX.

**Verification:** sync reducers unit tests, conflict UI tests.

## Итерация 8: Backend integration

**Deliverables:** auth, notebook list/detail, sync, AI API.

**Verification:** MSW contract tests, Playwright через local environment.

## Итерация 9: Hardening

**Deliverables:** charts, offline checks, a11y, error messages, performance на long notebooks.

**Verification:** full suites + production build.

## Первые три PR

1. App shell, routes, docs refs, baseline tokens
2. Mock screens, stores, static editor layout
3. Block editing, local persistence, first test suite

## Отложено после core stability

- drag-and-drop ordering
- advanced Markdown rendering
- advanced chart customization
- export polish beyond canonical JSON
- optimistic multi-tab sync

## JSNB-50: Notebook Editor Static Template

Issue: `larchanka-training/js-notebook#50`

**Цель:** первый UI template editor page, vertical block layout, `text` и `code` blocks.

**Scope:** static/mock editor, sample blocks, in-memory add/delete/move/edit, run placeholder, output placeholder, desktop + Notion-like direction.

**Out of scope:** real execution, backend, sync, AI, durable persistence, new UI library.

**Статус:** completed (см. чеклисты в [plan.md](./plan.md)).
