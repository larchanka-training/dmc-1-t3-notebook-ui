# ADR-014: Линт архитектуры FSD

## Status

Accepted

## Context

Правила FSD из `ui_architecture.md` §4 легко нарушить при правках (deep import, cross-feature, импорт вверх по слоям). Нужна автоматическая проверка, совместимая с составным store в `app/model/`.

## Decision

Два инструмента:

### 1. Steiger + `@feature-sliced/steiger-plugin`

- Конфиг: `ui/steiger.config.ts`
- Область: `ui/src/`
- `pnpm lint:fsd` — только Steiger; `pnpm lint` — ESLint + Steiger

Основные настройки: `no-cross-imports` — error; `no-higher-level-imports` — error, но **off** в `features/**/model`, `pages/**/model` и тестах (для `@/app/model`); отключены правила, конфликтующие с layout Version 1 (`app/ui/`, `shared/types/`).

### 2. `eslint-plugin-boundaries`

- Конфиг: `ui/eslint.fsd.config.js`, подключение в `eslint.config.js`
- Правило `boundaries/dependencies` для `src/**/*.{ts,tsx}` (без тестов)
- Слои: shared, entities, features, pages, app — как в §4.1; из features/pages разрешён импорт `app`.

### Команды

```bash
pnpm lint       # ESLint + Steiger
pnpm lint:fsd   # только Steiger
```

## Consequences

### Positive

- Нарушения слоёв и public API ловятся в `pnpm lint`.

### Negative

- Два конфига нужно обновлять согласованно при смене правил.
- При выносе store из `app/model` пересмотреть исключения Steiger.

## Related Documents

- [ui_architectureRU.md](../ui_architectureRU.md) §4
- [ADR-013](./ADR-013-fsd-source-layoutRU.md)
- [libsRU.md](../libsRU.md)
