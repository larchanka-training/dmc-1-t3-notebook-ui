# ADR-004: Chart Library

## Status

Accepted with follow-up version pin

## Decision

Use `Recharts` as the initial chart rendering library for Version 1 notebook outputs.

## Context

Charts are a required output type in Version 1, but the product does not yet require advanced chart authoring.

## Rationale

- sufficient for simple chart output rendering
- easier to adopt than a heavier charting platform
- good enough for notebook-oriented charts in early scope

## Consequences

- keep chart DTOs simple in Version 1
- revisit if richer chart interactions or performance constraints appear
