# Frontend State Model

## Purpose

This document describes the frontend state model at a higher level than the individual Zustand store definitions.

It focuses on:

- which state domains exist
- which state is persistent
- which state is ephemeral
- which state is derived

## State Domains

The frontend state is split into these domains:

- auth state
- notebook collection state
- active notebook editing state
- block interaction state
- execution runtime state
- sync state
- app-wide UI state

## Store Inventory

- `authStore`
- `notebookListStore`
- `activeNotebookStore`
- `blockUiStore`
- `executionStore`
- `syncStore`
- `appUiStore`

## Persistent State

Persistent state should be written to IndexedDB when relevant:

- notebook working copy
- notebook title
- ordered blocks
- local notebook metadata (including `hasUnsyncedChanges`)
- sync metadata

Persistent state should not depend on runtime outputs.

`hasUnsyncedChanges` is stored in local notebook metadata in IndexedDB and may be mirrored in memory for fast UI updates. It is not a pure derived-only flag. See [ADR-007](./adr/ADR-007-unsynced-changes-persistence.md).

## Ephemeral State

Ephemeral state should remain in memory only:

- open menus
- selected block
- focused block
- AI prompt visibility
- current loading spinners
- current execution in progress
- transient error banners that are not part of durable notebook state

## Derived State

Derived state is computed from base state and should not usually be persisted:

- whether a selected block is executable
- whether sync is currently allowed
- whether a notebook list is empty
- current route-level guard state
- current execution badge label

## What Lives In Each Store

### `authStore`

- authenticated status
- current user
- login request states
- login errors

### `notebookListStore`

- notebook list items
- list filters
- list loading and errors

### `activeNotebookStore`

- active notebook identity
- editable blocks
- notebook title
- dirty markers
- local working copy data

### `blockUiStore`

- selected block id
- focused block id
- visible block toolbar
- visible AI prompt
- local per-block draft UI flags

### `executionStore`

- active session id
- run status
- running blocks
- outputs by block id
- execution error descriptors

### `syncStore`

- last synced revision
- last sync timestamp
- sync in-progress state
- sync success state
- sync error state
- sync conflict state

### `appUiStore`

- toasts
- global banners
- modal visibility outside feature-specific stores

## Boundaries To Preserve

- execution state must not become durable notebook state by accident
- sync state must describe alignment, not replace notebook content ownership
- block UI state must not own actual notebook content
- auth state must not store notebook content

## Reset Rules

On logout:

- reset notebook list state
- reset active notebook state
- reset execution state
- reset sync state

On notebook switch:

- clear block UI ephemeral state
- clear or reset execution session state
- load the new local working copy
