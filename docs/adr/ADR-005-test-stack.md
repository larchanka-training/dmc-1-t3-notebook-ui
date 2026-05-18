# ADR-005: Test Stack

## Status

Accepted

## Decision

Use:

- `Vitest` for unit and UI integration tests
- `@testing-library/react` for component and page behavior
- `MSW` for API mocking
- `Playwright` for smoke and critical E2E flows

## Context

The frontend is built with React and Vite and needs a practical layered test stack.

## Rationale

- Vite-native test tooling reduces friction
- Testing Library aligns with user-facing behavior tests
- MSW supports contract-aware API simulation
- Playwright covers real browser flows including offline scenarios

## Consequences

- keep E2E scope narrow and critical
- push most logic verification downward into unit and UI integration tests
