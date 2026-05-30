# ADR-002: IndexedDB Library

## Status

Accepted

## Decision

Use `Dexie` `4.2.0` for browser-side persistent notebook storage.

Persist at minimum:

- active notebook working copy (title, ordered blocks, revision fields)
- per-notebook local metadata (see [ADR-007](./ADR-007-unsynced-changes-persistence.md))
- sync metadata (`baseRevision`, `lastSyncedRevision`, `syncStatus`, timestamps)

## Context

IndexedDB is a core product behavior because the app is local-first and offline-capable.

## Rationale

- simpler and safer than raw IndexedDB APIs
- good fit for notebook working copies and sync metadata
- reduces infrastructure noise in feature code
- Dexie schema versioning supports future migrations

## Consequences

- persistence logic lives behind adapters in `shared/persistence`
- notebook editing code must not talk to raw IndexedDB directly
- execution outputs and ephemeral UI state must not be written to Dexie by default
- Zustand stores may mirror persisted fields in memory but IndexedDB remains the reload source of truth for durable notebook data

## Related Documents

- [notebook_schema.md](../notebook_schema.md)
- [state_model.md](../state_model.md)
- [ADR-007](./ADR-007-unsynced-changes-persistence.md)
