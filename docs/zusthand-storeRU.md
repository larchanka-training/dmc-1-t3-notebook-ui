# Модель Zustand stores

> Неканонический русскоязычный companion. Каноническая версия: [zusthand-store.md](./zusthand-store.md).

## Назначение

Рекомендуемый набор Zustand stores для frontend.

Архитектура проекта уже фиксирует `Zustand` как модель state для Version 1.

## Список stores

### `authStore`

**Назначение:** authenticated vs unauthenticated, login UI transitions, session summary.

**Содержит:** auth status, user summary, OTP request/verify status, Google sign-in status, auth errors.

**Не содержит:** списки notebook, контент notebook, raw block outputs.

### `notebookListStore`

**Назначение:** экран коллекции notebook.

**Содержит:** list items, search query, loading/empty/error.

**Не содержит:** active notebook block editing state.

### `activeNotebookStore`

**Назначение:** редактируемая рабочая копия notebook.

**Содержит:** id, title, ordered blocks, revision markers, dirty markers, timestamps.

Это editing source of truth.

### `blockUiStore`

**Назначение:** block-local interaction state (ephemeral).

**Содержит:** selected/focused block id, open toolbar, open AI prompt, draft UI state.

### `executionStore`

**Назначение:** execution lifecycle и output binding.

**Содержит:** session id, status, running target/ids, block outputs, errors, cancellation.

Владеет runtime artifacts, не durable notebook state.

### `syncStore`

**Назначение:** explicit synchronization lifecycle.

**Содержит:** last synced revision, timestamps, in-progress/success/error/conflict, divergence summaries.

### `appUiStore`

**Назначение:** app-wide ephemeral presentation.

**Содержит:** toasts, page transition indicators, modals, global UI flags.

## Правила взаимодействия stores

### `activeNotebookStore` и `executionStore`

- blocks — durable editable content
- outputs — runtime artifacts
- смена кода блока может инвалидировать outputs, но execution layer не переписывает структуру blocks

### `activeNotebookStore` и `syncStore`

- active store владеет editable snapshot
- sync store владеет alignment с сервером

### `blockUiStore` и `activeNotebookStore`

- blockUi — selection и visible controls
- activeNotebook — фактический контент блока

### `authStore` и notebook stores

- смена auth может инвалидировать notebook-derived state
- notebook stores сбрасываются при logout

## Рекомендации по персистентности

**IndexedDB:** working copy, local metadata, sync metadata.

**Не персистить по умолчанию:** menus, selected block, toasts, running execution, AI prompt visibility.

## Derived selectors

Полезные селекторы: `hasUnsyncedChanges`, `selectedBlock`, `selectedCodeBlock`, `canRunSelectedBlock`, `canSync`, `currentSyncStatusLabel`, `visibleBlockOutput`, `isAuthenticated`.

Вычислять из store state, не дублировать избыточно.
