# UI Structure

## 1. Purpose

This document defines the preferred naming and screen anatomy for the notebook UI.

It exists to:

- standardize how screen areas and controls are named in UI discussions
- reduce ambiguous labels such as "header", "actions", or "toolbar" without scope
- keep the notebook editor compact and low-noise
- align block chrome with the Version 1 vertical document model

This document is a UI naming and composition reference.

It does not replace:

- route definitions in `ui_architecture.md`
- FSD source code layout rules
- product requirements for block types, execution, sync, or AI

## 2. Naming Principles

Use names by **scope first**, then by **role**.

Preferred pattern:

```text
<Scope>.<Element>
```

Examples:

- `App.Header`
- `Sidebar.NotebookList`
- `Notebook.TopBar`
- `NotebookCanvas.InsertBar`
- `Block.Toolbar`
- `Block.ActionCluster`
- `Block.OutputPanel`

Use names that describe the user-facing role, not the implementation detail.

Prefer:

- `Code Block`
- `Text Block`
- `Block Content`
- `Block Output`
- `Run Action`
- `AI Action`
- `Sync Status`

Avoid:

- `JavaScript` as a persistent visible block label when the editor type already makes it obvious
- `Editable Source`
- provider-specific labels in the main UI such as `Generate bedrock`
- generic names with unclear scope such as `Header`, `Actions`, `Status`, `Toolbar`

## 3. App-Level Screen Anatomy

The preferred screen structure is:

```text
App
  App.Header
    Header.Logo
    Header.Navigation
    Header.UserMenu

  App.Sidebar
    Sidebar.TopBar
    Sidebar.NewNotebookAction
    Sidebar.NotebookList
    Sidebar.UserSection

  App.Main
    Notebook.Header
    Notebook.TopBar
    Notebook.Canvas
```

### 3.1 App.Header

Use `App.Header` only for the global application bar.

Do not reuse `Header` for notebook-level areas.

### 3.2 App.Sidebar

Use `Sidebar` for global notebook navigation and account-related secondary content.

Preferred child names:

- `Sidebar.TopBar`
- `Sidebar.NewNotebookAction`
- `Sidebar.NotebookList`
- `Sidebar.NotebookListItem`
- `Sidebar.UserSection`

`Sidebar.UserSection` may contain compact utility navigation such as `Help` in addition to the user summary.

Avoid ambiguous labels like `Sidebar Header` and `Sidebar Footer` unless the visual design truly depends on those zones.

### 3.3 App.Main

Use `App.Main` for the editor page content area.

Inside it, distinguish:

- `Notebook.Header`
- `Notebook.TopBar`
- `Notebook.Canvas`

## 4. Notebook-Level Anatomy

The notebook page should be compact and document-first.

Preferred structure:

```text
Notebook
  Notebook.Header
    Notebook.Title
    Notebook.Meta

  Notebook.TopBar
    Notebook.InsertTextAction
    Notebook.InsertCodeAction
    Notebook.RunAllAction
    Notebook.StopAction
    Notebook.SyncAction
    Notebook.SyncStatus
    Notebook.RuntimeStatus
    Notebook.LocalAiStatus

  Notebook.Canvas
    NotebookCanvas.InsertBar
    Block
    NotebookCanvas.InsertBar
    Block
    NotebookCanvas.InsertBar
```

### 4.1 Notebook.Header

`Notebook.Header` is for notebook identity, not for dense operational controls.

Preferred content:

- `Notebook.Title`
- `Notebook.Meta`

`Notebook.Meta` may include:

- block count
- revision or sync state
- other short notebook-level metadata

It should not become a second toolbar.

### 4.2 Notebook.TopBar

`Notebook.TopBar` is the main operational control row for notebook-level actions.

Preferred actions:

- insert text block
- insert code block
- run all
- stop
- sync

Preferred status items:

- `Notebook.SyncStatus`
- `Notebook.RuntimeStatus`
- `Notebook.LocalAiStatus` when optional browser-local AI mode is intentionally exposed

Use `RuntimeStatus` rather than a provider-specific label such as `WebLLM Status` unless the product intentionally exposes runtime mode switching.

When optional browser-local AI mode is visible in the product, prefer a separate `LocalAiStatus` item rather than overloading `RuntimeStatus`.

Recommended `Notebook.LocalAiStatus` responsibilities:

- explicit local runtime preparation action
- local runtime readiness or failure summary
- optional local provider detail such as `webllm:<model>`

Do not use `Notebook.LocalAiStatus` as a generic backend provider health badge.
The canonical backend AI path remains the default generate path and should stay implicit unless the UI has a specific eligibility or error reason to explain.

### 4.3 Notebook.Canvas

`Notebook.Canvas` is the vertical document flow area.

Use `NotebookCanvas.InsertBar` for inline block insertion points.

Avoid extra permanent chrome that interrupts reading flow.

## 5. Block Anatomy

The block should be compact by default.

Preferred block structure:

```text
Block
  Block.ActionCluster
  Block.Content
  Block.OutputPanel
  Block.Toolbar
```

### 5.1 Block Chrome Rules

The default block should **not** have a permanent top header or bottom footer.

Remove redundant chrome such as:

- block headers that only repeat the block type
- labels like `JAVASCRIPT` when the editor surface already communicates code
- labels like `EDITABLE SOURCE`
- empty or near-empty block footers

The block should earn vertical space only for content, primary actions, and actual output.

### 5.2 Block.ActionCluster

`Block.ActionCluster` is the small, near-block action area used for the primary task of that block.

It should contain only the actions relevant to the block type and current state.

For a `Code Block`, preferred items are:

- `Block.RunAction`
- `Block.RunFromHereAction`
- `Block.ExecutionStatus`
- optional compact execution-order badge near the code gutter:
  - shown only for `code` blocks
  - empty before the block completes successfully
  - shows the current session execution order after successful run

For a `Text Block`, preferred items are:

- `Block.AIAction`
- optional secondary local generate action when local AI runtime is already ready
- block-local result state such as `Submitting`, `Ready`, or `Failed`

Use generic product terms such as `AI Action` or `Generate Code`.

Do not expose provider names in the default action label.

`Block.ActionCluster` should not own notebook-wide local AI runtime preparation or readiness messaging.
If browser-local AI mode is available, its prepare/bootstrap lifecycle belongs to `Notebook.TopBar`, while the text block keeps only source-block generation actions and result states.

### 5.3 Block.Content

Use `Block.Content` for the editable primary surface.

Sub-elements:

- `Block.MarkdownEditor`
- `Block.CodeEditor`

Do not add extra wrapper labels unless they help with accessibility or a real mode switch.

### 5.4 Block.OutputPanel

Use `Block.OutputPanel` only when the block produces output.

Output belongs close to the code block that produced it.

Preferred output subtypes:

- `Output.Text`
- `Output.Object`
- `Output.Table`
- `Output.Chart`
- `Output.Error`

No output panel is needed for a text block unless a documented feature introduces one.

### 5.5 Block.Toolbar

`Block.Toolbar` is the secondary block-management control group.

Preferred items:

- `Block.MoveUpAction`
- `Block.MoveDownAction`
- `Block.DeleteAction`

`Block.Toolbar` should be hidden by default and appear only when the block is selected or otherwise clearly active.

Goals:

- reduce visual noise
- keep the canvas readable
- expose structural actions only when the user is working with that block

`Block.Toolbar` should not compete visually with `Block.ActionCluster`.

Use this distinction:

- `Block.ActionCluster` = work inside the block
- `Block.Toolbar` = manage the block itself

## 6. Recommended Naming Vocabulary

Preferred terms:

| Use                                    | Preferred term                                 |
| -------------------------------------- | ---------------------------------------------- |
| Whole editor page                      | `Notebook`                                     |
| Global app top bar                     | `App.Header`                                   |
| Notebook-specific top controls         | `Notebook.TopBar`                              |
| Vertical document area                 | `Notebook.Canvas`                              |
| Inline insert control                  | `NotebookCanvas.InsertBar`                     |
| Small primary action area near a block | `Block.ActionCluster`                          |
| Secondary block management controls    | `Block.Toolbar`                                |
| Editable area of a block               | `Block.Content`                                |
| Executed result area                   | `Block.OutputPanel`                            |
| Notebook-wide state item               | `SyncStatus`, `RuntimeStatus`, `LocalAiStatus` |

Terms to avoid in product and design discussion unless further scoped:

- `Header`
- `Footer`
- `Actions`
- `Status`
- `Toolbar`
- `Panel`

If one of these words is necessary, always scope it:

- `Notebook.TopBar`
- `Block.Toolbar`
- `Notebook.SyncStatus`

## 7. UI Direction for Compact Blocks

The current preferred direction is:

1. Keep each block visually light.
2. Remove redundant labels that restate the obvious.
3. Reserve visible controls for the current task.
4. Show block-management controls only for the active block.
5. Keep output attached to the producing code block.
6. Preserve a calm vertical reading and editing flow.

This means the target block UI is closer to a document editor with contextual controls than to a card-based dashboard with permanent per-block chrome.
