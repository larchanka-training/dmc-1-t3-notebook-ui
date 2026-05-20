# ADR-011: Schema Validation With Zod

## Status

Accepted

## Decision

Use `Zod` `4.1.5` for runtime validation and typed parsing at frontend boundaries.

Validate or parse at minimum:

- API request and response DTOs at the HTTP client boundary
- notebook and block payloads loaded from or saved to IndexedDB
- execution output normalization results before they enter `executionStore`
- sync request and conflict response payloads

Prefer entity-level schemas in `entities/*/model/` and reuse them from persistence and API adapters.

## Context

The product depends on structured notebook JSON, sync metadata, and normalized execution outputs. TypeScript alone does not protect runtime boundaries from malformed backend or persistence data.

## Rationale

- keeps frontend assumptions explicit instead of implicit
- catches contract drift early during mock-first development
- pairs well with entity mappers and React Query result handling
- supports future Dexie schema migrations with safe parsing

## Consequences

- add Zod schemas alongside entity types where validation is needed
- fail loudly at boundaries; do not silently coerce unknown notebook shapes into the editor
- validation helpers live in `entities/` or `shared/lib`, not inside presentational components
- OpenAPI alignment remains a follow-up once backend contracts stabilize

## Related Documents

- [notebook_schema.md](../notebook_schema.md)
- [api_contracts.md](../api_contracts.md)
- [libs.md](../libs.md)
- [ADR-006](./ADR-006-api-client-strategy.md)
