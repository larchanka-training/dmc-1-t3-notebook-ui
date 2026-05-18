# Frontend Testing Strategy

## Purpose

This document defines the frontend-specific testing strategy for the `ui` repository.

It complements the monorepo-level QA plan with a narrower focus on frontend implementation.

## Test Stack

Recommended stack:

- `Vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `MSW`
- `Playwright`

## Testing Layers

### Unit

Test pure logic such as:

- notebook block ordering
- dirty state calculation
- sync state mapping
- runtime output normalization
- schema validation helpers

### UI Integration

Test routed pages and feature behavior such as:

- login form states
- notebook list screen states
- block toolbar behavior
- AI prompt visibility
- sync conflict display
- output binding to blocks

### E2E

Test narrow critical flows such as:

- open routes
- create notebook
- edit blocks
- reload and restore local working copy
- run blocks
- explicit sync

## Coverage Map By Implementation Stage

### Iteration 1

Test:

- app boot
- route rendering
- route fallback behavior if applicable

### Iteration 2

Test:

- screen loading, empty, success, error states
- page-level actions and navigation

### Iteration 3

Test:

- add block
- delete block
- move block up
- move block down
- edit text block
- edit code block

### Iteration 4

Test:

- save notebook to IndexedDB
- restore on reload
- mark unsynced changes

### Iteration 5

Test:

- run current block
- run all
- run from selected block
- shared execution session behavior
- timeout and cancellation behavior
- error output normalization

### Iteration 6

Test:

- AI prompt open and close
- AI draft persistence in memory
- proposal insertion behavior

### Iteration 7

Test:

- sync success
- sync failure
- sync conflict
- conflict actions

### Iteration 8

Test:

- real contract-aligned request flows with MSW fixtures
- page behavior against realistic API responses

## Frontend E2E Minimum

The minimum stable E2E pack should cover:

- login route renders correctly
- notebook list route renders correctly
- notebook editor route renders correctly
- create local notebook flow
- add and edit blocks
- reload and recover local notebook state
- execute a simple code flow

## What Not To Over-Test Early

- low-value snapshot tests for whole pages
- detailed visual regression before the UI structure stabilizes
- deep E2E coverage for every component state

## Required Verification Before Completion

For behavior changes run in this order:

1. lint
2. typecheck
3. unit tests
4. UI integration tests
5. build
6. Playwright smoke where the flow is user-critical
