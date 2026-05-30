# ADR-006: Стратегия API-клиента

> Неканонический русскоязычный companion. Каноническая версия: [ADR-006-api-client-strategy.md](./ADR-006-api-client-strategy.md).

## Status

Accepted

## Decision

Thin custom client в `shared/api` + `@tanstack/react-query` `5.87.1`.

Разделение:

- React Query — server state (auth, lists, sync mutations, AI requests)
- Zustand — editor working copy, block UI, execution, sync conflict UI, app UI

Валидация на границе — `Zod` ([ADR-011](./ADR-011-schema-validation-zodRU.md)).

## Rationale

- явные HTTP details
- меньше ad hoc async lifecycle
- editor state не уезжает в server cache

## Consequences

- pages комбинируют React Query hooks и Zustand selectors
- DTO validation на boundary
