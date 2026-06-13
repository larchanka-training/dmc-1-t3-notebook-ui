# Runtime Architecture

## Purpose

This document defines the current frontend-side JavaScript execution model for Version 1.

The project architecture already fixes:

- client-side execution
- frontend-side execution orchestration
- isolated execution

## Where And How JavaScript Executes

Notebook JavaScript executes in the browser, outside the main UI thread.

Current model:

- execution orchestration lives in the frontend application
- code execution happens in a dedicated `Web Worker`
- the worker owns the execution session state boundary

This is the implemented Version 1 baseline because it balances:

- implementation complexity
- responsiveness
- isolation from the main React UI thread

## Worker vs iframe Strategy

### Current Version 1 Choice

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
- the worker initializes the notebook runtime boundary for the session

### Session Reuse

- running another block in the same notebook reuses the same worker session
- variables and previously defined functions remain available according to the current runtime implementation model
- current Stage 6 semantics:
  - `run current` reuses the current live worker session without replaying upstream source history inside the runtime
  - `run from here` reuses the current live worker session without replaying upstream source history inside the runtime
  - if the current session has already been reset, terminated, timed out, or does not contain the upstream state required by the selected range, the runtime must not silently reconstruct that state through hidden replay fallback
  - the user-visible behavior for that missing-state case must stay explicit in orchestrator/runtime contracts rather than being inferred from incidental implementation details

### Session Reset

- `run all` may either:
  - reset the session first and execute from top to bottom
  - or explicitly provide a separate `reset and run all` action
- current Version 1 behavior:
  - `run all` resets the session before running
  - `run current` and `run from here` reuse the current session unless a reset is requested
  - `run all` remains the standard clean-session entry point before full notebook execution

### Session End

- closing the notebook page destroys the in-memory session
- session state is not durable notebook state

## Timeout, Cancelation, And Error Normalization

### Timeout

Current Version 1 approach:

- orchestrator tracks a configurable soft timeout
- if the worker exceeds the timeout, the UI marks the execution as timed out
- the worker is terminated and replaced with a new clean worker

### Cancelation

Current Version 1 approach:

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

### Session Validity After Errors

Current semantics:

- a syntax error in one block run does not implicitly reset the whole worker session
- a runtime error in one block run does not automatically mark the whole worker session as corrupted
- previously established session state remains valid unless the runtime is explicitly reset, stopped, terminated, or replaced after timeout
- `stop` and `timeout` are the coarse-grained cases that terminate the worker and guarantee that the next run starts from a clean session

## Output Normalization

The runtime bridge should convert raw worker messages into frontend output types:

- `text`
- `object`
- `table`
- `chart`
- `error`

The worker should not send arbitrary UI markup.

### Output Storage Semantics

Version 1 frontend state should store execution outputs per `blockId` as `outputs of latest run`.

Recommended semantics:

- `outputs[blockId]` is an ordered array of normalized outputs produced by the latest run of that block
- a new run for that block replaces the previous latest-run array instead of appending to a session-wide history
- the array order must match the arrival order of normalized runtime messages
- missing `outputs[blockId]` means the block has no result from a latest run yet
- present but empty `outputs[blockId]` means the latest run has started but no outputs have arrived yet
- `text` blocks do not receive output entries

This model keeps the Stage 5 store compatible with future multi-message outputs without turning the execution store into a durable or session-wide event log.

## Security Boundaries

Version 1 notebook code is untrusted.

Current boundaries:

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

Current message categories are split by direction.

App to worker:

- `RUN_BLOCKS`
- `RESET_SESSION`
- `TERMINATE_SESSION`

Worker to app:

- `execution-started`
- `execution-output`
- `execution-error`
- `execution-complete`

Runtime messages should also carry a run-scoped identifier such as `executionId`.

Reason:

- prevents stale worker messages from a terminated or replaced worker from mutating the current execution state
- allows the store to ignore outputs or errors that belong to an older run after `stop`, `reset`, timeout, or rapid re-run

### Current Implementation Note

The current worker bridge implementation covers:

- typed runtime protocol
- worker spawn and terminate lifecycle
- session reuse for sequential `run current` and `run from here` executions
- reset before `run all`
- timeout-driven terminate and recreate behavior
- notebook-order sequencing in the execution orchestrator for `run current`, `run all`, and `run from here`

The worker bridge still remains transport and lifecycle infrastructure.

Notebook-order range selection remains an execution orchestrator responsibility rather than a worker responsibility.

Current runtime behavior:

- the runtime now keeps session state inside the live worker context instead of replaying previously executed source blocks before each run
- repeated `run current` of the same block rebinds top-level declarations inside the live session without relying on replay-branch truncation
- `run from here` executes only the block sequence provided by the orchestrator; it does not reconstruct omitted upstream state through hidden replay
- after reset, stop, timeout, or fresh session start, missing upstream state remains an explicit contract case and surfaces through normal runtime errors until the needed setup blocks are run again
- the Stage 6 migration summary remains documented in `docs/plans/06-live-worker-session-transition-plan.md` as historical context

## Open Questions

- whether to expose a limited console capture API in Version 1
- whether future versions should promote latest-run output arrays into a richer console or streaming model
- whether to permit `fetch` from notebook code in Version 1 or gate it behind a runtime policy
- whether charts are emitted as explicit chart objects or inferred from helper API calls
- whether a future iframe-based DOM runtime will be needed for richer examples
