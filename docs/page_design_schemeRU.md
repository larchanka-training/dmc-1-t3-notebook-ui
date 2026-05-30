# Схема дизайна страниц

> Неканонический русскоязычный companion. Каноническая версия: [page_design_scheme.md](./page_design_scheme.md).

## Назначение

Текущая схема дизайна страниц вне notebook editor и выравнивание editor с ней.

**Scope:** `/login`, `/notebooks`, app shell.

**Вне scope:** существующий дизайн `/notebooks/:notebookId` editor (отдельно в architecture docs).

## App Shell

Спокойный product UI:

- header `h-14`, `bg-surface`, `border-ink/10`, `px-6`
- muted nav links
- без декоративного chrome

Тон: operational SaaS/work-tool, не editorial.

## Login Page

- centered form, `bg-surface-muted`, card `bg-surface`
- `border-ink/10`, `rounded-lg`, `p-6`, `space-y-3`
- primary blue, secondary bordered
- errors с `role="alert"`

## Notebook List Page

- `max-w-3xl`, `p-6`
- compact header + primary action
- bordered list, inline empty/loading/error

## Design tokens в использовании

Tailwind из `tailwind.config.js`:

| Token           |     Value | Usage                   |
| --------------- | --------: | ----------------------- |
| `surface`       | `#ffffff` | cards, header, controls |
| `surface-muted` | `#f7f7f5` | page background         |
| `ink`           | `#1f1f1f` | primary text            |
| `ink-muted`     | `#6b6b6b` | secondary text          |
| `accent`        | `#2563eb` | primary actions, focus  |

Для editor CSS — semantic variables только если aligned с Tailwind scheme.

## Typography

System sans: title `text-2xl font-semibold`, card title `text-xl`, labels `text-sm text-ink-muted`, mono только в code surfaces.

Избегать: serif hero, oversized typography, decorative uppercase labels.

## Layout rules

Muted background, white surfaces, compact spacing, subtle borders.

Ширины: forms `max-w-sm`, list `max-w-3xl`, editor document ~`max-w-5xl`.

## Controls

Primary filled blue, secondary bordered white, disabled muted, `focus-visible` accent outline.

Editor CSS scope кнопок под editor root — без global `button` overrides.

## State patterns

loading, empty, error, success, disabled.

Editor: placeholders sync/run/export disabled до реализации; output у code block; distinct error/conflict позже.

## Рекомендации для Notebook Editor

- neutral background, white surfaces
- compact sticky top bar
- sans для metadata/controls, mono для JS source
- block radius ≤ 8px
- local action cluster, output у code block
- subtle borders, vertical mobile flow
- keyboard reachable actions

Избегать: отдельная warm palette, decorative backgrounds, hero title, global side panels, card-in-card, new UI library.
