# UI Architecture

## 1. Purpose

This document defines the architecture of the frontend application.

It fixes:

- the frontend routing model
- the main UI screens
- the notebook editor layout
- the block-level interaction model
- the frontend state architecture
- the relationship between UI, local storage, execution, backend, and AI
- the fixed frontend technology decisions for Version 1

## 2. Fixed Version 1 Decisions

The following UI decisions are fixed for Version 1:

1. The application uses three routes:
   - `/login`
   - `/notebooks`
   - `/notebooks/:notebookId`
2. Frontend application state is managed with `Zustand`.
3. Text blocks are edited as `Markdown`.
4. Code blocks are edited with `CodeMirror`.
5. The notebook editor uses a vertical document layout.
6. The AI flow is block-scoped and works only in the context of a selected code block.
7. The block action cluster is shown near the block and contains:
   - block toolbar trigger
   - AI action
   - run/stop action
8. Output types are:
   - `text`
   - `object`
   - `table`
   - `chart`
   - `error`
9. Images are not a Version 1 block type.
10. Image rendering support is not part of the Version 1 UI architecture.
11. Authentication entry supports both `Email + OTP` and `Google OAuth`.

## 3. Frontend Role in the System

The frontend application is responsible for:

- authentication entry UI
- Google sign-in initiation UI
- notebook list UI
- notebook editor UI
- block editing
- block ordering and block-level actions
- execution controls and execution feedback
- output rendering
- AI prompt entry for a selected code block
- local persistence integration
- synchronization status and synchronization actions

The frontend owns the active working copy of the notebook during editing.

## 4. Routing Model

The frontend routing model is:

### 4.1 `/login`

Purpose:

- collect user email
- collect OTP
- initiate Google sign-in
- transition the user into authenticated state

### 4.2 `/notebooks`

Purpose:

- show the list of notebooks available to the user
- create a notebook
- open a notebook

### 4.3 `/notebooks/:notebookId`

Purpose:

- open the notebook editor
- load the active notebook working copy
- edit blocks
- run notebook code
- perform sync
- use AI for block-level code updates

## 5. Screen Structure

### 5.1 Login Screen

The login screen contains:

- email input
- submit action for OTP request
- OTP input
- submit action for OTP verification
- Google sign-in action
- request status feedback
- authentication error feedback

### 5.2 Notebook List Screen

The notebook list screen contains:

- page header
- create notebook action
- notebook list
- notebook list item actions as needed
- loading state
- empty state
- error state

### 5.3 Notebook Editor Screen

The notebook editor screen contains:

- top notebook action bar
- central vertical block list
- block-level action cluster beside each block
- block content area
- block output area for executable blocks
- sync state indicator

The notebook editor screen does not include a global AI workspace in Version 1.

## 6. Notebook Editor Layout

The notebook editor uses a `notion-like` vertical reading and editing flow.

The layout structure is:

1. top action bar
2. notebook metadata area where needed
3. ordered vertical block sequence
4. block-local output directly attached to the related code block

The top action bar contains notebook-level actions such as:

- notebook title display or editing
- sync action
- run-all action
- export action
- navigation actions where needed

The layout does not use a permanent split-view or a permanent global side panel in Version 1.

## 7. Block Model in the UI

The frontend supports two block types:

- `text`
- `code`

Each rendered block contains:

- block container
- block action cluster
- block content area
- block-specific UI state

Code blocks additionally contain:

- code editor
- run/stop control
- AI action
- output area

Text blocks contain:

- Markdown editing area

## 8. Block Action Cluster

Each block displays a block action cluster near the block.

The cluster contains:

1. `Block toolbar trigger`
   Opens block actions such as:
   - add block above
   - add block below
   - delete block
   - move block up
   - move block down

2. `AI action`
   Opens AI prompt UI for the selected code block.

3. `Run/Stop action`
   Starts execution or stops the running block execution flow when applicable.

The action cluster is local to the block and is not a notebook-global control area.

## 9. Text Block Editing

Text blocks are edited as `Markdown`.

Version 1 text editing uses a Markdown-oriented editing surface.

The text block UI supports:

- plain text entry
- Markdown syntax entry
- normal text block editing operations

Version 1 does not include a rich text editor.

## 10. Code Block Editing

Code blocks are edited with `CodeMirror`.

The code block UI supports:

- editing executable `JavaScript`
- preserving code content as part of the notebook block
- block-level execution actions
- AI-assisted code replacement or refinement

The code editor is part of the block and not a detached IDE workspace.

## 11. Output Rendering

Output is rendered in the context of the code block that produced it.

Supported output types in Version 1 are:

- `text`
- `object`
- `table`
- `chart`
- `error`

Output is shown directly below or beside the relevant code block content area inside the block context.

Output is not modeled as a standalone notebook block type.

## 12. AI User Flow

The AI flow is block-scoped.

The frontend AI interaction model is:

1. The user selects a target code block.
2. The user clicks the block AI action.
3. The frontend opens a prompt input UI for that block.
4. The user enters a prompt.
5. The frontend sends the prompt and relevant notebook context through the backend AI endpoint.
6. The frontend receives generated code.
7. The frontend inserts the generated code into the selected code block as a proposed update.
8. The user confirms, edits, or replaces the inserted code.

Version 1 does not include:

- a global AI editor
- a separate AI chat page
- notebook-wide detached AI authoring workflow

## 13. Execution User Flow

The frontend supports these execution actions:

- run current block
- stop current running execution flow when applicable
- run all blocks
- run from selected block

The execution UI is responsible for:

- dispatching execution commands to the execution orchestrator
- showing running state
- showing success or error results
- binding outputs to the correct block

The execution UI uses block-level and notebook-level controls, not a detached console-first workflow.

## 14. Local Persistence and Sync UX

The frontend integrates local persistence and explicit synchronization.

The UI responsibilities are:

- keep the active notebook working copy locally persisted
- mark the notebook when unsynced changes exist
- allow explicit user-triggered sync
- show sync status
- show sync conflict state explicitly if returned by the backend

Version 1 does not hide synchronization behind a silent always-on merge model.

## 15. Frontend State Architecture

Frontend application state is managed with `Zustand`.

The frontend state is divided into the following logical areas:

### 15.1 Auth State

Contains:

- authentication status
- current user session awareness
- login flow state
- OTP flow UI state
- Google sign-in flow state

### 15.2 Notebook List State

Contains:

- notebook list data
- notebook list loading state
- notebook list error state

### 15.3 Active Notebook State

Contains:

- active notebook identity
- notebook metadata
- ordered blocks
- local working copy state
- dirty or unsynced markers

### 15.4 Block UI State

Contains:

- selected block
- focused block
- block toolbar visibility
- block-local editing UI state
- AI prompt visibility for a block

### 15.5 Execution State

Contains:

- current execution status
- current execution target
- running block markers
- execution error state
- block output bindings

### 15.6 Sync State

Contains:

- last synchronized state markers
- sync in-progress state
- sync success state
- sync conflict state
- sync error state

### 15.7 App UI State

Contains:

- global loading indicators where needed
- transient notifications
- page-level UI state

## 16. Data Flow Boundaries

The frontend communicates with the following system parts:

### 16.1 Backend API

Used for:

- authentication
- notebook list loading
- notebook retrieval
- notebook synchronization
- AI requests

### 16.2 Local Storage

Used for:

- local notebook working copy persistence
- reload recovery
- local sync metadata

### 16.3 Execution Orchestrator

Used for:

- run block
- run from block
- run all
- stop execution

### 16.4 Execution Runtime

Used indirectly through the execution orchestrator for:

- isolated `JavaScript` execution
- output production
- execution session state

## 17. Error and Empty States

The frontend must explicitly render:

- login error state
- notebook list empty state
- notebook list error state
- notebook load error state
- block execution error state
- sync error state
- sync conflict state
- AI request error state

These states are part of the architecture and not optional visual polish.

## 18. Version 1 Out-of-Scope UI Features

The following UI features are outside Version 1:

- rich text editor
- image block type
- image rendering inside blocks
- global AI workspace
- real-time collaborative editing UI
- inline review comment system
- multi-pane IDE-like workspace

## 19. Related Documents

- [system_architecture.md](../../docs/system_architecture.md)
- [tech_stack.md](../../docs/tech_stack.md)
- [project.md](../../docs/project.md)
