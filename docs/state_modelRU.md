# Модель frontend-state

> Неканонический русскоязычный companion. Каноническая версия: [state_model.md](./state_model.md).

## Назначение

Документ описывает модель frontend-state на уровне выше отдельных Zustand store definitions.

Фокус:

- какие домены state существуют
- что persistent, ephemeral и derived

## Домены state

- auth state
- notebook collection state
- active notebook editing state
- block interaction state
- execution runtime state
- sync state
- app-wide UI state

## Инвентарь stores

- `authStore`
- `notebookListStore`
- `activeNotebookStore`
- `blockUiStore`
- `executionStore`
- `syncStore`
- `appUiStore`

## Persistent state

Пишется в IndexedDB:

- notebook working copy
- notebook title
- ordered blocks
- local notebook metadata
- sync metadata

Не должна зависеть от runtime outputs.

## Ephemeral state

Только в памяти:

- open menus
- selected / focused block
- AI prompt visibility
- loading spinners
- execution in progress
- transient error banners (не durable notebook state)

## Derived state

Вычисляется из базового state, обычно не персистится:

- `hasUnsyncedChanges`
- selected block executable
- sync allowed
- list empty
- route guard state
- execution badge label

## Содержимое каждого store

### `authStore`

- authenticated status, current user
- login request states, login errors

### `notebookListStore`

- list items, filters, loading, errors

### `activeNotebookStore`

- active notebook identity, editable blocks, title, dirty markers, working copy

### `blockUiStore`

- selected/focused block id, toolbar visibility, AI prompt visibility, draft UI flags

### `executionStore`

- session id, run status, running blocks, outputs by block id, execution errors

### `syncStore`

- last synced revision, timestamps, in-progress/success/error/conflict

### `appUiStore`

- toasts, global banners, modals вне feature-specific stores

## Границы

- execution state не становится durable notebook state случайно
- sync state описывает alignment, не заменяет ownership контента
- block UI state не владеет контентом блока
- auth state не хранит notebook content

## Правила сброса

**Logout:** сброс list, active notebook, execution, sync.

**Switch notebook:** очистка block UI ephemeral state, reset execution session, загрузка новой local working copy.
