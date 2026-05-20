# ADR-007: Персистентность unsynced-флага

> Неканонический русскоязычный companion. Каноническая версия: [ADR-007-unsynced-changes-persistence.md](./ADR-007-unsynced-changes-persistence.md).

## Status

Accepted

## Decision

Персистить `hasUnsyncedChanges` в **local metadata** notebook в IndexedDB.

Не считать флаг только derived/in-memory.

Обновление:

- `true` — локальный durable content разошёлся с последним synced baseline
- `false` — после успешного explicit sync
- сохранять вместе с local metadata при каждом relevant save

## Rationale

- reload и offline должны сохранять «есть несинхронизированные изменения»
- проще для badges и editor chrome, чем полный пересчёт на cold start

## Consequences

- убран из derived-state в `state_model.md`
- Dexie adapters читают/пишут флаг
- Zustand может зеркалить в памяти, после reload authoritative — IndexedDB
