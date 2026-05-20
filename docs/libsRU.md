# Frontend-библиотеки

> Неканонический русскоязычный companion. Каноническая версия: [libs.md](./libs.md).

## Назначение

Рекомендуемые frontend-библиотеки для планирования Version 1.

Различает: уже установленные, зафиксированные архитектурой, рекомендуемые к добавлению, отложенные.

## Маркеры статуса

- `Already installed` — в `package.json`
- `Architecturally fixed` — mandated документацией
- `Recommended to add` — для V1, ещё не в repo
- `Not for stage 1` — отложено

> Актуальные версии в `package.json` могут отличаться от planning doc; при расхождении приоритет у кода и [libs.md](./libs.md) после обновления.

## Уже установлено

| Пакет                                       | Статус            | Зачем                                 |
| ------------------------------------------- | ----------------- | ------------------------------------- |
| `react` / `react-dom` 18.3.x                | Already installed | UI framework                          |
| `typescript` 5.6.x                          | Already installed | типизация schemas/state               |
| `vite`                                      | Already installed | dev/build                             |
| `@vitejs/plugin-react`                      | Already installed | React + Vite                          |
| `eslint`                                    | Already installed | lint chain + FSD boundaries (ADR-014) |
| `eslint-plugin-boundaries`                  | Already installed | слои FSD в ESLint                     |
| `steiger`, `@feature-sliced/steiger-plugin` | Already installed | линт структуры FSD (`pnpm lint:fsd`)  |
| `react-router-dom` 6.x                      | Already installed | три product routes                    |
| `zustand` 5.x                               | Already installed | state (architecturally fixed)         |
| `vitest`, Testing Library                   | Already installed | tests                                 |

## Рекомендуется добавить

| Пакет                                     | Зачем                                    |
| ----------------------------------------- | ---------------------------------------- |
| `dexie`                                   | IndexedDB, working copy + sync metadata  |
| `zod`                                     | validation на API/persistence boundaries |
| `@tanstack/react-query`                   | server-state lifecycle (не editor state) |
| `@uiw/react-codemirror` + `@codemirror/*` | CodeMirror для code blocks (fixed)       |
| `recharts`                                | chart output type (ADR-004)              |
| `msw`                                     | contract-aware API tests                 |
| `@playwright/test`                        | smoke E2E, offline scenarios             |

## Not for stage 1

| Категория        | Примеры                      | Причина                               |
| ---------------- | ---------------------------- | ------------------------------------- |
| UI frameworks    | MUI, Chakra, Ant             | shadcn/ui зафиксирован в `shared/ui/` |
| Rich text        | TipTap, Lexical              | V1 = Markdown-oriented                |
| Global state     | Redux, MobX                  | Zustand fixed                         |
| DnD              | dnd-kit, react-beautiful-dnd | move up/down достаточно               |
| Form frameworks  | react-hook-form, formik      | мало форм в V1                        |
| `react-markdown` | —                            | renderer после стабилизации editing   |

## Version sources

Рекомендуемые версии в [libs.md](./libs.md) проверялись по npm на `2026-05-18`.
