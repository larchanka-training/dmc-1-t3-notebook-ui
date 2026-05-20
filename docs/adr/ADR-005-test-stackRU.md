# ADR-005: Тестовый стек

> Неканонический русскоязычный companion. Каноническая версия: [ADR-005-test-stack.md](./ADR-005-test-stack.md).

## Status

Accepted

## Decision

- `Vitest` `4.1.6` (совместим с Vite 8)
- `@testing-library/react` `16.3.0`
- `@testing-library/user-event`
- `MSW` `2.11.1`
- `@playwright/test` `1.54.2`

## Rationale

- Vite-native unit/UI tests
- Testing Library — user-facing behavior
- MSW — contract-aware API mocks
- Playwright — browser smoke и offline/reload

## Consequences

- узкий E2E scope
- основная логика — unit и UI integration
