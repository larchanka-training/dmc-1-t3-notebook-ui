# ADR-002: IndexedDB-библиотека

> Неканонический русскоязычный companion. Каноническая версия: [ADR-002-indexeddb-library.md](./ADR-002-indexeddb-library.md).

## Status

Accepted

## Decision

Использовать `Dexie` `4.2.0` для browser-side persistent storage.

Персистить:

- working copy активного notebook
- local metadata (см. [ADR-007](./ADR-007-unsynced-changes-persistenceRU.md))
- sync metadata

## Context

IndexedDB — core product behavior (local-first, offline).

## Rationale

- проще и безопаснее raw IndexedDB
- подходит для working copy и sync metadata
- версионирование схемы Dexie

## Consequences

- persistence только через adapters в `shared/persistence`
- execution outputs и ephemeral UI в Dexie по умолчанию не пишутся
- после reload источник правды — IndexedDB для durable notebook data
