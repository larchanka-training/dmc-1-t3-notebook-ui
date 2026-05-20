# ADR-006: API Client Strategy

## Status

Accepted

## Decision

Use a thin custom API client in `shared/api` plus `@tanstack/react-query` `5.87.1` for server-state lifecycle management.

Division of responsibility:

- React Query owns auth session fetch, notebook list/detail queries, sync mutations, and AI request lifecycle
- Zustand owns editor working copy, block UI, execution outputs, sync conflict presentation state, and ephemeral app UI

Request and response shapes should be validated or mapped at the API boundary with `Zod` (see [ADR-011](./ADR-011-schema-validation-zod.md)).

## Context

The app has clear backend boundaries for auth, notebooks, sync, and AI, but editor state must remain local and product-specific.

## Rationale

- custom client keeps request details explicit and easy to mock
- React Query handles async caching, retries, and loading state for server data
- avoids pushing notebook editor state into server-state infrastructure
- matches the mock-first implementation plan before full backend integration

## Consequences

- editor state remains in Zustand, not in React Query cache
- API DTO validation should use shared schemas or mappers at the boundary
- pages compose React Query hooks for server data and Zustand selectors for local editing state

## Related Documents

- [api_contracts.md](../api_contracts.md)
- [ui_architecture.md](../ui_architecture.md) §4, §17
- [ADR-011](./ADR-011-schema-validation-zod.md)
