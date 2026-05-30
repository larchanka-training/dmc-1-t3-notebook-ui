# ADR-013: Структура исходников FSD

## Status

Accepted

## Context

В Version 1 зафиксирован Feature-Sliced Design (FSD) в `ui_architecture.md` §4. Нужна конкретная структура `src/`, правила public API и владение хуками, чтобы страницы, фичи, сущности и app shell оставались слабо связанными.

Общие доменные типы (блоки блокнота, placeholder вывода) используются несколькими entity-слайсами. Строгий FSD запрещает прямые импорты между соседними `entities/*`.

## Decision

Организовать `ui/src/` по каноническим слоям и сегментам из `ui_architecture.md` §4:

```text
app → pages → features → entities → shared
```

### Ответственность слоёв

| Слой        | Владеет                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| `app/`      | Провайдеры, роутер, глобальный layout, составной root store (`useAppStore`) |
| `pages/`    | Route shell; page hooks только для маршрута (redirect, `useParams`)         |
| `features/` | Пользовательские сценарии; feature hooks и UI; фабрики Zustand-слайсов      |
| `entities/` | Доменные формы, чистые хелперы, переиспользуемый entity UI                  |
| `shared/`   | API client, persistence, UI kit, кросс-entity типы, generic lib             |

### Public API

- Каждый слайс в `features/`, `entities/`, `pages/`, `shared/` экспортирует public API через `index.ts`.
- Внешние импорты только с корня слайса (`@/features/auth`, `@/entities/notebook`, `@/shared/ui`).
- Deep import в `ui/`, `model/`, `api/`, `lib/` из других слайсов запрещён.

### Page и feature hooks

- **Feature hooks** (`features/*/model/use*.ts`) — логика сценария.
- **Page hooks** (`pages/*/model/use*.ts`) — только маршрут.
- Feature UI вызывает свой hook внутри; страницы рендерят `<FeatureView />` без дублирования логики.
- В `*.tsx` один hook из `model/` того же слайса, деструктуризация (без объекта `vm` в JSX).

### Типы в entities

| Entity              | `model/types.ts`            |
| ------------------- | --------------------------- |
| `entities/block`    | `TextBlock`, `CodeBlock`    |
| `entities/notebook` | `Notebook`, `NotebookBlock` |
| `entities/output`   | `OutputPlaceholder`         |

`shared/types/` — только типы, используемые несколькими модулями (в V1 пустой public API). `entities/notebook` импортирует block-типы из `@/entities/block` для `NotebookBlock`.

### Составной Zustand store

- Типы и фабрики слайсов в `features/*/model/`.
- Сборка в `app/model/store.ts`; public API store — `app/model/index.ts`.
- Feature/page hooks могут импортировать `useAppStore` из `@/app/model` на период миграции (см. [ADR-014](./ADR-014-fsd-architecture-lintRU.md)).

### Mock-константы

Значения mock/stub в `features/<name>/model/constants.ts` (например `MOCK_OTP` в `features/auth/model/constants.ts`).

### App shell

Сегменты `providers/`, `router/`, `ui/`, `model/`, `styles/`. Hooks роутера и layout — в `app/router/` и `app/ui/` рядом с UI.

## Related Documents

- [ui_architectureRU.md](../ui_architectureRU.md) §4
- [ADR-009](./ADR-009-zustand-state-modelRU.md)
- [ADR-014](./ADR-014-fsd-architecture-lintRU.md)
