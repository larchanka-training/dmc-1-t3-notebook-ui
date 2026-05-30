# ADR-004: Chart Library

## Status

Accepted

## Decision

Use `Recharts` `2.15.3` as the chart rendering library for Version 1 notebook `chart` outputs.

## Context

Charts are a required output type in Version 1, but the product does not yet require advanced chart authoring or editing.

## Rationale

- sufficient for simple chart output rendering from normalized chart DTOs
- easier to adopt than a heavier charting platform
- good enough for notebook-oriented charts in early scope
- already aligned with the chart output envelope in `notebook_schema.md`

## Consequences

- keep chart DTOs simple in Version 1 (`chartType`, `data`, `xKey`, `yKey`)
- chart rendering components live near output rendering, not inside durable notebook blocks
- revisit the library choice only if richer interactions or performance constraints appear

## Related Documents

- [notebook_schema.md](../notebook_schema.md)
- [ui_architecture.md](../ui_architecture.md) §12
- [libs.md](../libs.md)
