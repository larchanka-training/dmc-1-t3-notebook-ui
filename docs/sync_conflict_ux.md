# Sync Conflict UX

## Purpose

This document defines the explicit user experience for notebook sync conflicts in Version 1.

The project architecture already fixes:

- manual sync
- explicit conflict handling
- no automatic merge

## What Counts As A Conflict

A conflict happens when:

- the client sync request is based on `baseRevision = X`
- the server durable notebook has already advanced beyond `X`
- the local working copy and server copy therefore diverged

## Required Conflict UI

The user must see:

- a clear `Sync conflict` status
- local revision or base revision information
- current server revision information
- a short explanation that automatic merge was not performed
- action buttons for next steps

The conflict state must be visually stronger than normal sync error states.

## User Actions

Recommended Version 1 actions:

- `Review server version`
- `Keep local version for later`
- `Replace local with server version`
- `Retry after decision`

Optional future action:

- `Export local version before overwrite`

## Base Revision Meaning

`baseRevision` means:

- the last server revision that the current local working copy was known to match when local edits continued

It is not:

- the count of local edits
- the current server revision

## Showing Local And Server Divergence

Version 1 should not attempt a fully automatic merge UI.

Instead show:

- local title summary
- server title summary
- local updated time if known
- server updated time
- local block count
- server block count

For a later version, structured block-level diff may be added.

## Recommended Screen Placement

On `/notebooks/:notebookId`:

- conflict status appears in the notebook top action bar area
- detailed conflict panel opens inline or in a modal

The conflict must not be hidden in a generic toast alone.

## Suggested Wording

Primary message:

- `This notebook has changed on the server since your local version was based on revision X. Automatic merge was not performed.`

Supporting message:

- `Review the server version before deciding whether to overwrite or discard your local working copy.`

## Recovery Paths

### Replace Local With Server

- discard local working copy
- load server notebook
- reset sync state to synced

### Keep Local For Later

- keep local working copy in IndexedDB
- preserve conflict status
- do not silently drop user edits

### Retry After Decision

- only available after the user explicitly chooses the source of truth

## Non-Goals For Version 1

- automatic line merge
- Git-like merge conflict editor
- collaborative merge resolution
