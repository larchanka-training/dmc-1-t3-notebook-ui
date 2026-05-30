# ADR-008: Block Insertion Above And Below

## Status

Accepted

## Decision

The block toolbar supports inserting new blocks **above** and **below** the current block.

For both `text` and `code` block types, expose four insert actions:

- add text block above
- add text block below
- add code block above
- add code block below

Keep deterministic `move up` and `move down` actions for reordering. Do not require drag-and-drop in Version 1.

## Context

`ui_architecture.md` defines the block action cluster with add-above and add-below behavior. An earlier layout draft described insert-after only, which was inconsistent with the canonical UI architecture.

## Rationale

- matches user expectations from Notion-like vertical editors
- gives precise control when inserting explanatory text or code around an existing block
- avoids a separate global block palette in Version 1
- reordering remains explicit and testable without DnD infrastructure

## Consequences

- `notebook_block_layout_schema.md` documents above/below insertion as the canonical UX
- screen specs and editor feature work should implement four insert actions, not insert-after only
- new blocks receive stable ids and are inserted at the correct index in `activeNotebookStore`
- inserting a block should mark local metadata `hasUnsyncedChanges` when content changed (see [ADR-007](./ADR-007-unsynced-changes-persistence.md))

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §9
- [notebook_block_layout_schema.md](../notebook_block_layout_schema.md)
- [screen_specs.md](../screen_specs.md)
