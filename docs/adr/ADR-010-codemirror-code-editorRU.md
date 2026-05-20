# ADR-010: Редактор кода CodeMirror

> Неканонический русскоязычный companion. Каноническая версия: [ADR-010-codemirror-code-editor.md](./ADR-010-codemirror-code-editor.md).

## Status

Accepted

## Decision

`CodeMirror 6` для JavaScript code blocks:

- `@uiw/react-codemirror` `4.25.1`
- `@codemirror/state` `6.5.2`
- `@codemirror/view` `6.x`
- `@codemirror/lang-javascript` `6.x`

Source of truth — `block.content.source` в working copy.

## Rationale

- зрелый JS editor с возможностью extensions
- React wrapper ускоряет ранние итерации
- код остаётся в контексте block row

## Consequences

- изменения source → `activeNotebookStore` + persistence
- rich text для text blocks — вне V1
- `react-markdown` — отложен
