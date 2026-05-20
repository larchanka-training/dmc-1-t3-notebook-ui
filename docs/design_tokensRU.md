# Design tokens

> Неканонический русскоязычный companion. Каноническая версия: [design_tokens.md](./design_tokens.md).

## Назначение

Начальное направление design tokens для notebook UI.

Лёгкий baseline без новой UI library.

## Typography

Роли:

- `font-sans` — controls и navigation
- `font-mono` — code и technical values
- `font-reading` — notebook text (опционально позже)

Guidance: читаемость, различимость code vs text, умеренный line height.

## Colors

Группы: `color-bg-app`, `color-bg-surface`, `color-bg-editor`, borders, text primary/secondary/muted, accent primary/danger/warning/success.

Guidance: без generic purple-first; distinct outputs/status; достаточный contrast.

## Spacing

`space-2` … `space-32` — inline controls vs block/page sections.

## States

Токены для: loading, empty, error, success, disabled, **conflict** (отличим от generic error).

## Block chrome

`block-radius`, `block-padding`, `block-gap`, `block-border`, `block-bg`, `block-hover-shadow`, `block-selected-ring`.

Guidance: action cluster локален блоку; outputs привязаны к code block.

## Accessibility

- keyboard для block actions
- visible focus
- labels для icon-only buttons
- readable status для assistive tech
- contrast

## Responsive

- vertical flow на mobile
- compact action cluster на narrow screens
- без fixed split layouts в V1

См. также operational tokens в [page_design_schemeRU.md](./page_design_schemeRU.md) (`surface`, `ink`, Tailwind).
