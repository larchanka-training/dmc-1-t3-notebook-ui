# ADR-011: Валидация схем через Zod

> Неканонический русскоязычный companion. Каноническая версия: [ADR-011-schema-validation-zod.md](./ADR-011-schema-validation-zod.md).

## Status

Accepted

## Decision

`Zod` `4.1.5` на runtime boundaries:

- API DTO
- IndexedDB load/save
- normalized execution outputs
- sync request / conflict response

Схемы — в `entities/*/model/`, переиспользование в adapters.

## Rationale

- явные assumptions вместо implicit parsing
- раннее обнаружение contract drift
- подготовка к Dexie migrations

## Consequences

- fail loudly на boundaries
- validation не в presentational components
- OpenAPI alignment — follow-up
