# ADR-008: Вставка блоков above/below

> Неканонический русскоязычный companion. Каноническая версия: [ADR-008-block-insertion-above-below.md](./ADR-008-block-insertion-above-below.md).

## Status

Accepted

## Decision

Block toolbar поддерживает вставку **above** и **below** текущего блока.

Четыре действия для `text` и `code`:

- add text above / below
- add code above / below

Reorder — `move up` / `move down`. Drag-and-drop в V1 не нужен.

## Rationale

- соответствует Notion-like vertical editor
- точный контроль без global block palette
- явные, тестируемые операции

## Consequences

- канонический UX в `notebook_block_layout_schema.md`
- вставка обновляет `activeNotebookStore` и может выставить `hasUnsyncedChanges`
