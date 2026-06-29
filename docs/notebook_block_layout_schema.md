# Notebook Block Layout Schema

## Purpose

This document defines how notebook blocks are represented, ordered, placed in the editor flow, and structured in the Version 1 UI.

It complements:

- `ui_architecture.md`
- `ui-structure.md`
- `screen_specs.md`
- `notebook_block_sizing.md`

This document is focused on block layout and block-local UI structure.

## Block Types

Version 1 supports two notebook block types:

| Type   | Purpose                       | Editable content   |
| ------ | ----------------------------- | ------------------ |
| `text` | Markdown note content         | `content.markdown` |
| `code` | Executable JavaScript content | `content.source`   |

Outputs are not notebook blocks.

Outputs are execution artifacts bound to code blocks by `blockId`.

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
  ├─ Insert bar
  ├─ Text block
  ├─ Insert bar
  ├─ Code block
  │   └─ Output panel
  ├─ Insert bar
  ├─ Text block
  ├─ Insert bar
  └─ Code block
      └─ Output panel
```

## Editor Placement

The notebook editor uses a vertical document layout.

The block sequence belongs inside the notebook canvas.

The page structure is:

```txt
Editor page
  ├─ Notebook header
  ├─ Notebook top bar
  └─ Notebook canvas
      ├─ Insert bar
      ├─ Block 1
      ├─ Insert bar
      ├─ Block 2
      └─ Insert bar
```

The editor must not use:

- a permanent split workspace for block editing
- a permanent global side panel unrelated to the notebook flow
- dashboard-style block cards with persistent heavy chrome

## Block Sequence and Insertion

Blocks are rendered as an ordered vertical sequence inside the notebook canvas.

Block insertion is handled through inline insert controls in the sequence.

Preferred structure:

```txt
Notebook canvas
  ├─ NotebookCanvas.InsertBar
  ├─ Block
  ├─ NotebookCanvas.InsertBar
  ├─ Block
  └─ NotebookCanvas.InsertBar
```

This means insertion belongs to the document flow, not to a block action menu.

## Block Anatomy

Each block is rendered as one local UI unit with compact chrome.

Preferred structure:

```txt
Block
  ├─ Block.ActionCluster
  ├─ Block.Content
  ├─ Block.OutputPanel
  └─ Block.Toolbar
```

### Compact Chrome Rules

The default block should not include a permanent decorative header or footer.

Avoid redundant chrome such as:

- a persistent `JavaScript` label when the code editor already makes the block type obvious
- labels such as `Editable Source`
- empty or near-empty block footer rows
- extra framing that competes with the document flow

The block should spend vertical space on:

- editable content
- the primary action for the current block
- actual runtime output
- structural controls only when the block is active

## Block Row Behavior

Each block row contains two functional concerns:

```txt
Block row
  ├─ Primary block-local action area
  └─ Block content and output
```

On wide screens, the primary action area may sit beside the block content.

On narrow screens, it may move into the same vertical flow while remaining local to the block.

## Block.ActionCluster

`Block.ActionCluster` is the primary near-block action area.

It contains only the primary action relevant to the block type and current state.

For a `text` block, preferred items are:

- `Block.AIAction`
- optional secondary local generate action when notebook-level local AI runtime is already ready
- `Block.AIStatus`

For a `code` block, preferred items are:

- `Block.RunAction`
- `Block.RunFromHereAction`
- `Block.ExecutionStatus`

The action cluster must remain keyboard reachable.

It is local to the block and is not a notebook-global control area.

Notebook-wide local AI runtime preparation or readiness messaging does not belong here.
If optional browser-local AI mode is exposed, its bootstrap lifecycle belongs to `Notebook.TopBar`.

## Block.Toolbar

`Block.Toolbar` is the secondary block-management control group.

It is separate from `Block.ActionCluster`.

Preferred items:

- `Block.MoveUpAction`
- `Block.MoveDownAction`
- `Block.DeleteAction`

The block toolbar:

- is hidden by default
- becomes visible only when the block is selected or otherwise clearly active
- is used for structural actions, not for the primary work inside the block

This keeps structural actions available without adding constant visual noise.

## Text Block Layout

A text block is a Markdown editing surface.

Preferred structure:

```txt
Text block
  ├─ Block.ActionCluster
  │   ├─ AI action
  │   ├─ optional local generate action
  │   └─ AI status
  └─ Block.Content
      └─ Markdown editor
```

The editable value is:

```ts
block.content.markdown;
```

Text blocks do not have an output panel in Version 1.

The AI action belongs to eligible text blocks only.

If browser-local AI mode is enabled, text blocks may expose a local generate action only after the notebook-level local runtime has already been prepared.
The prepare/bootstrap control itself is notebook-scoped and should not repeat on every text block.

## Code Block Layout

A code block is a JavaScript editing surface with an attached output panel.

Preferred structure:

```txt
Code block
  ├─ Block.ActionCluster
  │   ├─ Run action
  │   ├─ Run from here action
  │   └─ Execution status
  ├─ Block.Content
  │   └─ Code editor
  ├─ Block.OutputPanel
  └─ Block.Toolbar
```

The editable value is:

```ts
block.content.source;
```

The output panel must remain visually attached to the code block that produced it.

Version 1 does not include a code-block AI action in the default block layout.

## Output Binding

Outputs are stored separately from durable notebook content blocks.

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

- preserve the vertical notebook flow
- keep block actions local to the block
- use inline insert controls inside the block sequence
- keep `Block.ActionCluster` and `Block.Toolbar` as separate concerns
- render text blocks as Markdown editing surfaces
- render code blocks as JavaScript editing surfaces
- keep output attached to the originating code block
- do not model output as a standalone notebook block
- do not add a default AI action to code blocks in Version 1
- do not introduce new block types without updating the architecture and schema documents
- preserve keyboard access for block actions
- preserve clear empty, disabled, running, success, and error states as those flows are implemented
