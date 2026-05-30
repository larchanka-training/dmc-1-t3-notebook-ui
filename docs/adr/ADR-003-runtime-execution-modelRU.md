# ADR-003: Модель runtime-выполнения

> Неканонический русскоязычный companion. Каноническая версия: [ADR-003-runtime-execution-model.md](./ADR-003-runtime-execution-model.md).

## Status

Accepted

## Decision

Primary runtime Version 1 — dedicated `Web Worker`.

Поведение:

- orchestration на frontend
- worker держит session scope notebook
- `run all` — reset session, затем run сверху вниз
- `run current` / `run from selected` — reuse session
- stop — terminate worker, новый worker для следующего run
- закрытие страницы editor — уничтожение session

`iframe` как primary runtime — не использовать в V1.

## Rationale

- не блокирует UI thread
- простой lifecycle через create/terminate
- message-based output normalization

## Consequences

- outputs в `executionStore`, не в durable notebook
- worker не получает stores, persistence, credentials
