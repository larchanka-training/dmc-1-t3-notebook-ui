# AGENTS

## Purpose

This file is the bootstrap entry point for AI agents working in the `ui` repository.

It defines the canonical UI documentation set, the local source-of-truth order, and the UI-specific execution constraints.

## Canonical Language

Use only English project documents as execution context.

Do not rely on Russian companion documents for implementation decisions.

## Required Reading Order

Before any non-trivial UI task, read:

1. The current approved task artifact:
   - issue
   - change request
   - sprint task
   - explicitly approved task comment
2. [docs/ui_architecture.md](./docs/ui_architecture.md)
3. Repository-specific operational and quality documents when they exist:
   - `docs/ci-cd.md`
   - UI testing strategy documents in `docs/`
4. Monorepo-level project documents when this repository is checked out inside the mono repository:
   - [../docs/requirements.md](../docs/requirements.md)
   - [../docs/project.md](../docs/project.md)
   - [../docs/system_architecture.md](../docs/system_architecture.md)
   - [../docs/tech_stack.md](../docs/tech_stack.md)
   - [../docs/qa-plan.md](../docs/qa-plan.md)
5. The actual UI code, tests, and existing component patterns
6. Relevant skill files in `.agent/skills/` or `.agents/` when the current task explicitly matches that skill

## Source of Truth Order

When sources conflict, use this precedence:

1. Current approved task artifact
2. `../docs/requirements.md` when available
3. `./docs/ui_architecture.md`
4. Monorepo system-level documents when available
5. Local UI operational and testing documents when present
6. Existing UI code and tests

## Mandatory UI Rules

- Follow the documented routing model.
- Follow the documented `Zustand` state model.
- Use `Markdown` for text block editing.
- Use `CodeMirror` for code block editing.
- Keep AI interaction block-scoped.
- Preserve the documented vertical notebook editor layout.
- Preserve the existing project design language and component conventions.
- Handle loading, empty, error, success, and disabled states for user-facing flows.
- Preserve accessibility and keyboard usability.
- Do not introduce a new design system or UI library without approval.
- Do not add frontend dependencies without approval.
- Add or update frontend tests for behavior changes.
- Run relevant lint, type, test, and build checks before claiming completion.

## Supplemental Agent Instructions

Skill files under `.agent/skills/` or `.agents/` are supplemental execution aids.

They do not override task scope, project requirements, or architecture documents.

## Related Documents

- [docs/ui_architecture.md](./docs/ui_architecture.md)
- [../docs/requirements.md](../docs/requirements.md)
- [../docs/system_architecture.md](../docs/system_architecture.md)
- [../docs/tech_stack.md](../docs/tech_stack.md)
