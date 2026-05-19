# Notebook Block Layout Schema

## Purpose

This document describes how notebook blocks are defined, ordered, placed on the editor page, and structured internally in the UI.

## Block Types

Version 1 supports two notebook block types:

| Type | Purpose | Editable content |
|---|---|---|
| `text` | Markdown note content | `content.markdown` |
| `code` | Executable JavaScript content | `content.source` |

Outputs are not notebook blocks. Outputs are execution artifacts bound to code blocks by `blockId`.

## Data Shape

A notebook block is one item in the notebook's ordered block list.

```ts
type NotebookBlock =
  | {
      id: string;
      type: "text";
      content: {
        markdown: string;
      };
    }
  | {
      id: string;
      type: "code";
      content: {
        source: string;
        language: "javascript";
      };
    };
```

The notebook owns block order through its `blocks` array.

```ts
type Notebook = {
  id: string;
  title: string;
  revision: number;
  blocks: NotebookBlock[];
};
```

The order of `notebook.blocks` is the visual order in the editor.

```txt
Notebook
  ├─ Text block
  ├─ Code block
  │   └─ Output area
  ├─ Text block
  └─ Code block
      └─ Output area
```

## Page Placement

The notebook editor uses a vertical document layout.

The page structure is:

```txt
Editor page
  ├─ Top action bar
  ├─ Notebook metadata
  └─ Ordered block list
      ├─ Block 1
      ├─ Block 2
      └─ Block N
```

The editor must not use a permanent split view or a permanent global side panel in Version 1.

## Block Placement

Each block is rendered as a row with two functional areas:

```txt
Block row
  ├─ Block action cluster
  └─ Block content area
```

On wide screens, the action cluster sits beside the block content. On narrow screens, it moves into the same vertical flow and remains local to the block.

## Block Action Cluster

The block action cluster is local to a single block.

It contains:

| Action | Applies to |
|---|---|
| Add text block after current block | `text`, `code` |
| Add code block after current block | `text`, `code` |
| Move block up | `text`, `code` |
| Move block down | `text`, `code` |
| Delete block | `text`, `code` |
| Run block | `code` only |

All actions must remain keyboard reachable.

## Text Block Layout

A text block is a Markdown editing surface.

```txt
Text block content area
  ├─ Label: Markdown
  └─ Markdown textarea
```

The editable value is:

```ts
block.content.markdown
```

Text blocks do not have output areas.

## Code Block Layout

A code block is a JavaScript editing surface with an attached output area.

```txt
Code block content area
  ├─ Code header
  │   ├─ Label: JavaScript
  │   └─ Run block action
  ├─ JavaScript source editor
  └─ Output area
```

The editable value is:

```ts
block.content.source
```

The output area must remain visually attached to the code block that produced it.

## Output Binding

Outputs are stored separately from notebook content blocks.

```ts
type OutputPlaceholder = {
  blockId: string;
  label: string;
};
```

The relationship is:

```txt
code block id: blk_prepare_data
output.blockId: blk_prepare_data
```

The editor resolves the output for a code block by matching `output.blockId` to `block.id`.

This keeps durable notebook content separate from execution artifacts while preserving a clear visual relationship between code and result.

## Required UI Rules

- Preserve the vertical notebook flow.
- Keep block actions local to the block.
- Render text blocks as Markdown editing surfaces.
- Render code blocks as JavaScript editing surfaces.
- Keep output attached to the originating code block.
- Do not model output as a standalone notebook block.
- Do not introduce new block types without updating the architecture and schema documents.
- Preserve keyboard access for block actions.
- Preserve clear empty, disabled, running, success, and error states as those flows are implemented.

