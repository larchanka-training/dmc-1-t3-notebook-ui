# Runtime Architecture

## Purpose

This document defines the recommended frontend-side JavaScript execution model for Version 1.

The project architecture already fixes:

- client-side execution
- frontend-side execution orchestration
- isolated execution

## Where And How JavaScript Executes

Notebook JavaScript should execute in the browser, outside the main UI thread.

Recommended model:

- execution orchestration lives in the frontend application
- code execution happens in a dedicated `Web Worker`
- the worker owns the execution session state

This is the recommended Version 1 baseline because it balances:

- implementation complexity
- responsiveness
- isolation from the main React UI thread

## Worker vs iframe Strategy

### Recommended Version 1 Choice

Use a dedicated `Web Worker` as the primary runtime.

Reason:

- avoids blocking the UI thread
- easier lifecycle control for run, reset, and terminate
- easier message-based result normalization

### Not Recommended For Stage 1

Use an `iframe` as the primary execution runtime.

Reason:

- more complex DOM boundary management
- harder to reason about browser capability exposure
- not needed unless future features require DOM-centric execution

## Session Lifecycle

### Session Start

- the first execution creates a runtime session
- the worker initializes a persistent scope for the notebook

### Session Reuse

- running another block in the same notebook reuses the same worker session
- variables and previously defined functions remain available

### Session Reset

- `run all` may either:
  - reset the session first and execute from top to bottom
  - or explicitly provide a separate `reset and run all` action
- recommended Version 1 behavior:
  - `run all` resets the session before running
  - `run current` and `run from selected` reuse the current session unless a reset is requested

### Session End

- closing the notebook page destroys the in-memory session
- session state is not durable notebook state

## Timeout, Cancelation, And Error Normalization

### Timeout

Recommended Version 1 approach:

- orchestrator tracks a configurable soft timeout
- if the worker exceeds the timeout, the UI marks the execution as timed out
- the worker is terminated and replaced with a new clean worker

### Cancelation

Recommended Version 1 approach:

- stop action terminates the current worker
- a fresh worker is spawned for future runs
- cancelation is coarse-grained rather than cooperative

### Error Normalization

The runtime adapter should normalize all errors into a consistent frontend shape:

```json
{
  "kind": "error",
  "name": "Error",
  "message": "Something failed",
  "stack": "optional stack string"
}
```

Normalization categories:

- syntax error
- runtime thrown error
- timeout
- canceled execution
- internal runtime bridge error

## Output Normalization

The runtime bridge should convert raw worker messages into frontend output types:

- `text`
- `object`
- `table`
- `chart`
- `error`

The worker should not send arbitrary UI markup.

## Security Boundaries

Version 1 notebook code is untrusted.

Recommended boundaries:

- runtime must not get direct access to React app internals
- runtime must not mutate app state except through normalized message outputs
- runtime must not receive backend credentials
- runtime must not receive raw session cookie access

Browser constraints already help because `HTTP-only` cookies are not directly readable in JavaScript.

### Additional Runtime Restrictions To Aim For

- do not expose app stores to the worker
- do not expose persistence adapters to the worker
- expose a very small runtime bridge API only if required

## Runtime Bridge Messages

Recommended message categories:

- `RUN_BLOCKS`
- `EXECUTION_RESULT`
- `EXECUTION_ERROR`
- `EXECUTION_COMPLETE`
- `RESET_SESSION`
- `TERMINATE_SESSION`

## Open Questions

- whether to expose a limited console capture API in Version 1
- whether to permit `fetch` from notebook code in Version 1 or gate it behind a runtime policy
- whether charts are emitted as explicit chart objects or inferred from helper API calls
- whether a future iframe-based DOM runtime will be needed for richer examples
