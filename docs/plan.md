# Frontend Implementation Plan

## Purpose

This document defines the recommended implementation sequence for the frontend.

The plan is intentionally mock-first:

- first establish UI structure and local behaviors
- then add local persistence and runtime execution
- only after that connect the real backend API

## Execution Principles

- deliver in small coherent vertical slices
- keep each iteration shippable in isolation where practical
- prefer local deterministic behavior before backend integration
- add verification at the same time as behavior

## Iteration 0: Documentation And Foundation

Goal:

- remove ambiguity before major code work

Deliverables:

- stack decisions fixed in docs
- screen specs
- store model
- notebook schema draft
- API contract draft
- ADR set

Verification:

- document review
- architectural alignment with `ui_architecture.md`

## Iteration 1: App Shell And Routing

Goal:

- establish the real application structure without business depth yet

Deliverables:

- route shell for `/login`, `/notebooks`, `/notebooks/:notebookId`
- app providers
- page layout skeletons
- baseline styles and tokens
- error boundary shell

Verification:

- lint
- typecheck
- route rendering tests

## Iteration 2: Mock Screens And UI States

Goal:

- make all Version 1 screens navigable with realistic mock data

Deliverables:

- login screen with email OTP and Google entry states
- notebook list screen with loading, empty, error, and success states
- notebook editor screen shell with block list and top action bar

Verification:

- UI integration tests per screen state
- Playwright smoke for route navigation

## Iteration 3: Notebook Domain And Zustand Stores

Goal:

- make the editor state real in memory

Deliverables:

- notebook and block schemas
- Zustand stores
- block creation, deletion, move up, move down
- text block editing
- code block editing shell

Verification:

- unit tests for notebook transforms
- UI integration tests for block operations

## Iteration 4: Local Persistence With IndexedDB

Goal:

- make the editor local-first

Deliverables:

- Dexie database
- notebook working copy persistence
- reload recovery
- local metadata and sync metadata persistence

Verification:

- unit tests for persistence adapters
- integration tests for restore after reload

## Iteration 5: Execution Runtime MVP

Goal:

- execute JavaScript code locally in isolated fashion

Deliverables:

- execution orchestrator
- worker-based runtime adapter
- run selected block
- run all
- run from selected block
- text, object, table, and error outputs

Verification:

- unit tests for orchestration ordering
- integration tests for output binding
- manual and automated negative cases for runtime errors

## Iteration 6: AI Mock Flow

Goal:

- validate the block-scoped AI UX without backend dependency

Deliverables:

- AI prompt UI on selected code block
- proposed code insertion flow
- confirm, edit, reject actions

Verification:

- UI integration tests for prompt lifecycle
- Playwright editor interaction smoke

## Iteration 7: Sync Mock Flow

Goal:

- validate explicit sync behavior and conflict UX before backend integration

Deliverables:

- sync button and sync statuses
- mock sync success flow
- mock sync error flow
- explicit sync conflict state

Verification:

- unit tests for sync status reducers and mappers
- UI tests for conflict display and user actions

## Iteration 8: Backend Integration

Goal:

- replace mocks with real API contracts

Deliverables:

- auth API integration
- notebook list and detail API integration
- sync API integration
- AI endpoint integration

Verification:

- MSW contract-aligned integration tests
- Playwright smoke through real local environment

## Iteration 9: Hardening And Release Readiness

Goal:

- make Version 1 robust and reviewable

Deliverables:

- chart output support
- offline degradation checks
- accessibility improvements
- error message refinement
- performance checks on long notebooks

Verification:

- lint
- typecheck
- unit and UI integration suites
- Playwright smoke and critical flows
- production build verification

## Recommended First Three Pull Requests

### PR 1

- app shell
- routes
- docs references from code
- baseline tokens

### PR 2

- mock screens
- state stores
- notebook editor static block layout

### PR 3

- block editing behavior
- local persistence
- first test suite

## Deferred Until After Core Stability

- drag-and-drop ordering
- advanced Markdown rendering
- advanced chart customization
- notebook export polish beyond canonical JSON
- optimistic multi-tab synchronization

## JSNB-50: Notebook Editor Static Template

Issue:

- `larchanka-training/js-notebook#50`

Goal:

- create the first UI template for the notebook editor page
- establish a vertical block-based notebook layout
- use the documented block model with ordered `text` and `code` blocks

Scope:

- render a static/mock notebook editor page
- render sample Markdown text blocks and JavaScript code blocks
- show block-local action placeholders for add, delete, move, and run
- show an output area placeholder attached to code blocks
- keep outputs separate from durable notebook block content
- preserve desktop usability and the Notion-like product direction

Out of scope:

- real code execution
- backend integration
- sync implementation
- AI integration
- durable local persistence
- new frontend UI library

Implementation checklist:

- [x] Add notebook/block/output TypeScript domain types.
- [x] Add sample notebook data using ordered `text` and `code` blocks.
- [x] Add a static notebook editor page composition.
- [x] Add text block and code block renderers with distinct visuals.
- [x] Add block-local action cluster placeholders.
- [x] Add run placeholder and output placeholder for code blocks.
- [x] Add accessible labels and keyboard-reachable controls for block actions.
- [x] Add UI tests for acceptance criteria and output separation.
- [x] Run lint, type/build, and tests.

Security checklist:

- [x] Do not execute sample JavaScript code.
- [x] Render sample code as text, not HTML.
- [x] Do not introduce backend calls or credential handling.
- [x] Keep runtime outputs outside durable notebook content.

Completion status:

- Status: completed.
- Verification: `npm run lint`, `npm test`, `npm run build`, `npm audit --audit-level=moderate`.
- Browser smoke: verified the editor template at `http://127.0.0.1:5174`.
