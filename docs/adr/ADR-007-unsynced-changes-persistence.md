# ADR-007: Unsynced Changes Persistence

## Status

Accepted

## Decision

Persist `hasUnsyncedChanges` in per-notebook **local metadata** stored in IndexedDB.

Do not treat `hasUnsyncedChanges` as a derived-only selector that exists only in memory.

Recommended local metadata shape:

```json
{
  "notebookId": "nb_123",
  "lastLocalSaveAt": "2026-05-18T10:05:30.000Z",
  "lastOpenedAt": "2026-05-18T10:05:40.000Z",
  "hasUnsyncedChanges": true,
  "localChangeCounter": 14
}
```

Update rules:

- set `hasUnsyncedChanges` to `true` when durable local notebook content diverges from the last known synced baseline
- set it to `false` after a successful explicit sync that realigns local and server state
- persist the flag together with other local metadata on each relevant save

## Context

The frontend is local-first and shows explicit sync status in the notebook editor. The product needs a durable unsynced indicator that survives reload and offline use.

An earlier draft of the state model listed unsynced status as derived-only, which conflicted with `notebook_schema.md`.

## Rationale

- reload and offline recovery must preserve whether the user still has unsent changes
- a persisted boolean is simpler for list badges and editor chrome than recomputing from multiple stores on every cold start
- `localChangeCounter` can still support diagnostics, but `hasUnsyncedChanges` is the primary UX flag
- sync alignment remains owned by `syncStore` and sync metadata; this flag describes local editing status

## Consequences

- `hasUnsyncedChanges` is removed from the derived-state list in `state_model.md`
- persistence adapters must read and write the flag in Dexie local metadata
- Zustand may mirror the flag in memory for fast UI updates, but IndexedDB is authoritative after reload
- do not persist execution outputs or ephemeral block UI state alongside this flag

## Related Documents

- [notebook_schema.md](../notebook_schema.md)
- [state_model.md](../state_model.md)
- [zusthand-store.md](../zusthand-store.md)
- [ADR-002](./ADR-002-indexeddb-library.md)
