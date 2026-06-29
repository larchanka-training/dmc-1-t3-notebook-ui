# Notebook Block Sizing

## Purpose

This document defines how `text` and `code` blocks should spend vertical space in the notebook editor.

It complements:

- `ui_architecture.md`
- `ui-structure.md`
- `notebook_block_layout_schema.md`

## Sizing Principles

Block height should follow actual content, not a large fixed card size.

Preferred rule:

```txt
block height = content height, constrained by block-type min/max bounds
```

This keeps the notebook compact for short notes while avoiding runaway tall editors for long content.

## Text Block Sizing

`Text` blocks should:

- open close to one or two visible lines for short content
- grow with the Markdown content as the user types
- stop growing after a reasonable maximum height
- switch to internal vertical scrolling only after that maximum is reached

The text editor should not use a large static minimum height such as a card-sized textarea for one-line content.

## Code Block Sizing

`Code` blocks should:

- open with a compact but usable minimum editor height
- grow based on the number of source lines
- stop growing after a reasonable maximum number of visible lines
- use internal scrolling only after the maximum visible height is reached

Code blocks should not use one fixed height for all cases because:

- short snippets waste space
- medium snippets hide the last lines too early

## Action Cluster Interaction

`Block.ActionCluster` must remain visually secondary to block content height.

Sizing implications:

- block content is the primary consumer of vertical space
- action chrome must not force a tall block on its own
- compact blocks must remain readable even when the action cluster is visible

## Version 1 Recommendation

Use these practical defaults unless a later task changes them:

- `Text block`: autosize from a compact minimum up to a bounded maximum, then scroll
- `Code block`: autosize from a compact minimum number of visible lines up to a bounded maximum, then scroll
- avoid block-type-wide fixed heights except as min/max guards
