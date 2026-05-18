# ADR-001: Routing Library

## Status

Accepted

## Decision

Use `react-router-dom` for frontend routing.

## Context

The application already has a fixed route model:

- `/login`
- `/notebooks`
- `/notebooks/:notebookId`

## Rationale

- standard React ecosystem choice
- suitable for route-level layout and guards
- sufficient for Version 1 complexity

## Consequences

- route definitions stay explicit and centralized
- page-level loading and redirect logic can be implemented cleanly
