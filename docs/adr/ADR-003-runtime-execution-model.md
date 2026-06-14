# ADR-003: Runtime Execution Model

## Status

Accepted

## Decision

Use a dedicated `Web Worker` as the primary JavaScript execution runtime for Version 1.

Version 1 execution behavior:

- orchestration stays in the frontend application layer
- the worker owns the in-memory execution session scope for a notebook
- `run all` resets the worker session before executing blocks from top to bottom
- `run current` and `run from here` reuse the current session unless the user explicitly resets
- `run from here` must not rely on hidden upstream replay fallback when the current worker session no longer contains the required state
- stop/cancel terminates the worker and spawns a fresh worker for the next run
- timeout terminates the worker and guarantees a fresh worker for the next run
- closing the notebook route destroys the in-memory session
- syntax error or runtime error in one block does not implicitly reset the worker session by itself

Do not use an `iframe` as the primary runtime in Version 1.

## Context

The project fixes client-side execution and isolated runtime behavior.

## Rationale

- avoids blocking the main UI thread
- simple lifecycle control through worker creation and termination
- supports message-based output normalization
- iframe-based DOM execution adds unnecessary complexity for Version 1 JavaScript blocks

## Consequences

- execution orchestrator remains frontend-side
- cancellation is coarse-grained by terminating the worker
- timeout recovery is coarse-grained by terminating and recreating the worker
- DOM-oriented execution is out of scope for Version 1
- normalized outputs live in `executionStore`, not in durable notebook content
- runtime must not receive app stores, persistence adapters, or backend credentials
- `run all` remains the standard clean-session entry point before full top-to-bottom execution

## Related Documents

- [runtime_architecture.md](../runtime_architecture.md)
- [zusthand-store.md](../zusthand-store.md)
