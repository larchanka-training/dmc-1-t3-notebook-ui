# ADR-005: Test Stack

## Status

Accepted

## Decision

Use:

- `Vitest` `4.1.6` for unit and UI integration tests
- `@testing-library/react` `16.3.0` for component and page behavior
- `@testing-library/user-event` for interaction tests
- `MSW` `2.11.1` for API mocking
- `@playwright/test` `1.54.2` for smoke and critical E2E flows

Vitest stays on the 4.x line because the repository uses `Vite` `8.x`.

## Context

The frontend is built with React and Vite and needs a practical layered test stack.

## Rationale

- Vite-native test tooling reduces friction
- Testing Library aligns with user-facing behavior tests
- MSW supports contract-aware API simulation without a live backend
- Playwright covers real browser flows including offline and reload scenarios

## Consequences

- keep E2E scope narrow and critical
- push most logic verification downward into unit and UI integration tests
- add Playwright coverage when persistence, sync, and execution flows become user-visible

## Related Documents

- [testing_strategy.md](../testing_strategy.md)
- [libs.md](../libs.md)
