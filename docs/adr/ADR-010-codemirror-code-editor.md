# ADR-010: CodeMirror Code Editor

## Status

Accepted

## Decision

Use `CodeMirror 6` for JavaScript code block editing via:

- `@uiw/react-codemirror` `4.25.1`
- `@codemirror/state` `6.5.2`
- `@codemirror/view` `6.x`
- `@codemirror/lang-javascript` `6.x`

Code block editable source of truth remains `block.content.source` in the notebook working copy.

## Context

Version 1 supports `text` and `code` blocks only. Code blocks execute JavaScript in an isolated worker runtime. `ui_architecture.md` fixes `CodeMirror` as the code editor.

## Rationale

- mature editing surface for JavaScript with extension support later
- React wrapper reduces custom bridge work in early iterations
- keeps code inside the block context instead of a detached IDE workspace
- explicit CodeMirror dependencies avoid hidden transitive version drift

## Consequences

- editor feature code integrates CodeMirror inside the block row layout
- code content changes update `activeNotebookStore` and local persistence
- do not add a rich text editor for text blocks in Version 1
- `react-markdown` rendering remains deferred until editing and persistence are stable

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §11
- [notebook_block_layout_schema.md](../notebook_block_layout_schema.md)
- [libs.md](../libs.md)
