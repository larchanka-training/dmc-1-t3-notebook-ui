# Zustand Store Model

## Purpose

This document defines the recommended Zustand store set for the frontend.

The project architecture already fixes `Zustand` as the frontend state model for Version 1.

## Store List

### `authStore`

Purpose:

- track authenticated vs unauthenticated app state
- manage login UI transitions
- hold the current session summary

Contains:

- auth status
- current user summary
- OTP request status
- OTP verify status
- Google sign-in start status
- auth error state

Does not contain:

- notebook lists
- notebook content
- raw block outputs

### `notebookListStore`

Purpose:

- manage the notebook collection screen

Contains:

- notebook list items
- active search query
- list loading state
- list empty state markers
- list error state

Does not contain:

- active notebook block editing state

### `activeNotebookStore`

Purpose:

- own the editable notebook working copy

Contains:

- active notebook id
- notebook title
- ordered blocks
- local revision markers
- dirty markers
- timestamps useful for persistence decisions

This store is the editing source of truth.

### `blockUiStore`

Purpose:

- manage block-local interaction state

Contains:

- selected block id
- focused block id
- open block toolbar id
- open AI prompt block id
- block-level draft UI state that should not be persisted

This store should remain ephemeral.

### `executionStore`

Purpose:

- manage execution lifecycle and output binding

Contains:

- execution session id
- execution status
- running target
- running block ids
- block outputs
- execution errors
- execution cancellation state

This store owns runtime artifacts, not durable notebook state.

### `syncStore`

Purpose:

- manage explicit synchronization lifecycle

Contains:

- last synced revision
- last sync timestamp
- sync in-progress flag
- sync success marker
- sync error state
- sync conflict state
- local and server divergence summaries

### `appUiStore`

Purpose:

- hold app-wide ephemeral presentation state

Contains:

- toast notifications
- page transition indicators where needed
- modal visibility not tied to a specific feature store
- generic global UI flags

## Cross-Store Interaction Rules

### `activeNotebookStore` and `executionStore`

- notebook blocks are durable editable content
- outputs are runtime artifacts
- a code block content change may invalidate outputs, but it must not rewrite the notebook block structure from the execution layer

### `activeNotebookStore` and `syncStore`

- `activeNotebookStore` owns the current editable snapshot
- `syncStore` owns whether that snapshot is aligned with the server

### `blockUiStore` and `activeNotebookStore`

- `blockUiStore` decides which block is selected or has visible inline controls
- `activeNotebookStore` decides what the block content actually is

### `authStore` and all notebook stores

- auth changes may invalidate notebook-derived state
- notebook stores should be reset or reinitialized on logout

## Persistence Guidance

Persist to IndexedDB:

- active notebook working copy
- local notebook metadata
- sync metadata

Do not persist by default:

- open menus
- selected block
- active toasts
- running execution status
- transient AI prompt visibility

## Derived Selectors

Useful derived selectors include:

- `hasUnsyncedChanges`
- `selectedBlock`
- `selectedCodeBlock`
- `canRunSelectedBlock`
- `canSync`
- `currentSyncStatusLabel`
- `visibleBlockOutput`
- `isAuthenticated`

Derived values should be computed from store state rather than stored redundantly when practical.
