# ADR-003: Runtime Execution Model

## Status

Accepted

## Decision

Use a dedicated `Web Worker` as the primary JavaScript execution runtime for Version 1.

## Context

The project fixes client-side execution and isolated runtime behavior.

## Rationale

- avoids blocking the main UI thread
- simple lifecycle control through worker creation and termination
- supports message-based output normalization

## Consequences

- execution orchestrator remains frontend-side
- cancellation is coarse-grained by terminating the worker
- DOM-oriented execution is out of scope for Version 1
