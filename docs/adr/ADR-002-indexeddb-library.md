# ADR-002: IndexedDB Library

## Status

Accepted

## Decision

Use `Dexie` for browser-side persistent notebook storage.

## Context

IndexedDB is a core product behavior because the app is local-first and offline-capable.

## Rationale

- simpler and safer than raw IndexedDB APIs
- good fit for notebook working copies and sync metadata
- reduces infrastructure noise in feature code

## Consequences

- persistence logic should live behind adapters in `shared/persistence`
- notebook editing code should not talk to raw IndexedDB directly
