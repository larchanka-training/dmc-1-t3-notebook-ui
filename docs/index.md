# UI Docs Index

## Purpose

This index is the navigation entry point for the `ui/docs` documentation set.

Use it to quickly find:

- the canonical UI architecture
- the implementation plan
- frontend technical decisions
- unresolved design areas
- ADRs

All canonical execution documents in this folder are written in English.

## Read Order For Most UI Tasks

1. `ui_architecture.md`
2. `frontend_architecture.md`
3. `libs.md`
4. `zusthand-store.md`
5. `state_model.md`
6. `screen_specs.md`
7. `testing_strategy.md`
8. Relevant ADRs in `adr/`
9. Topic-specific documents such as `api_contracts.md`, `runtime_architecture.md`, or `notebook_schema.md`

## Current Documents

### Core Architecture

- `ui_architecture.md`
  - Canonical UI architecture for Version 1.
  - Defines routes, editor layout, block model, AI scope, output types, and fixed frontend decisions.

- `frontend_architecture.md`
  - Repository-specific frontend structure.
  - Defines directories, module boundaries, provider composition, and frontend data flow.

- `state_model.md`
  - High-level model of persistent, ephemeral, and derived state.
  - Maps product concerns to frontend state ownership.

- `zusthand-store.md`
  - Store-by-store definition of the Zustand model.
  - Documents store responsibilities, ownership boundaries, and cross-store interactions.

### Planning and Stack

- `libs.md`
  - Recommended frontend libraries and versions.
  - Explains why each library is selected and whether it is already installed or already fixed by architecture.

- `plan.md`
  - Recommended implementation sequence by iteration.
  - Designed for incremental delivery with mock-first frontend execution.

### Product Data and Runtime

- `notebook_schema.md`
  - Canonical notebook JSON working model for frontend planning.
  - Includes block schemas, output schemas, local metadata, and sync metadata.

- `runtime_architecture.md`
  - Frontend-side JavaScript execution model.
  - Covers worker strategy, session lifecycle, timeout, cancelation, normalization, and security boundaries.

- `api_contracts.md`
  - Draft frontend-facing API contracts for auth, notebooks, sync, and AI.
  - Includes DTO examples and unresolved items that require backend alignment.

- `sync_conflict_ux.md`
  - Explicit conflict handling UX for manual synchronization.
  - Defines user actions and required information density.

### UX and QA

- `screen_specs.md`
  - Screen-by-screen Version 1 specification for `/login`, `/notebooks`, and `/notebooks/:notebookId`.

- `design_tokens.md`
  - Initial design token system and UI interaction rules.
  - Establishes a practical baseline without introducing a new component library.

- `testing_strategy.md`
  - Frontend-specific testing pyramid and coverage map.
  - Explains what to verify at each implementation stage.

### ADRs

- `adr/ADR-001-routing-library.md`
  - Routing library decision.

- `adr/ADR-002-indexeddb-library.md`
  - Local persistence library decision.

- `adr/ADR-003-runtime-execution-model.md`
  - Runtime execution model decision.

- `adr/ADR-004-chart-library.md`
  - Chart rendering library decision.

- `adr/ADR-005-test-stack.md`
  - Frontend test stack decision.

- `adr/ADR-006-api-client-strategy.md`
  - Frontend API client strategy decision.

## Companion Documents

- `ui_architectureRU.md`
  - Non-canonical Russian companion of the UI architecture.
  - Do not use as the implementation source of truth when it conflicts with English documents.
