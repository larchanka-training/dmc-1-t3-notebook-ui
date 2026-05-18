# Notebook Schema

## Purpose

This document defines the current working frontend schema for the canonical notebook JSON model.

This is a planning document for Version 1 implementation and must later be aligned with backend contracts.

## Canonical Notebook JSON

Recommended frontend notebook shape:

```json
{
  "id": "nb_123",
  "title": "Example notebook",
  "blocks": [
    {
      "id": "blk_1",
      "type": "text",
      "content": {
        "markdown": "# Title"
      }
    },
    {
      "id": "blk_2",
      "type": "code",
      "content": {
        "language": "javascript",
        "source": "const x = 1;\nconsole.log(x);"
      }
    }
  ],
  "revision": 3,
  "createdAt": "2026-05-18T10:00:00.000Z",
  "updatedAt": "2026-05-18T10:05:00.000Z"
}
```

## Notebook-Level Fields

### Required

- `id`
- `title`
- `blocks`
- `revision`
- `createdAt`
- `updatedAt`

### Notes

- `revision` is the last durable server revision known to the client
- `blocks` are ordered by array order
- Version 1 does not use additional block layout metadata

## Block Schemas

## Shared Block Fields

- `id`
- `type`
- `content`

Optional future-safe fields:

- `meta`

### Text Block

```json
{
  "id": "blk_text_1",
  "type": "text",
  "content": {
    "markdown": "## Notes\nSome text."
  }
}
```

Rules:

- `type` must be `text`
- `content.markdown` is the editable source of truth

### Code Block

```json
{
  "id": "blk_code_1",
  "type": "code",
  "content": {
    "language": "javascript",
    "source": "fetch('/api').then(console.log)"
  }
}
```

Rules:

- `type` must be `code`
- Version 1 `language` should always be `javascript`
- the code source remains normal editable content after AI updates

## Output Schemas

Outputs are not durable notebook blocks.

They are execution artifacts bound to code block ids.

### Shared Output Envelope

```json
{
  "blockId": "blk_code_1",
  "kind": "text",
  "producedAt": "2026-05-18T10:06:00.000Z",
  "sessionId": "exec_1"
}
```

### Text Output

```json
{
  "blockId": "blk_code_1",
  "kind": "text",
  "value": "hello"
}
```

### Object Output

```json
{
  "blockId": "blk_code_1",
  "kind": "object",
  "value": {
    "items": 3,
    "ok": true
  }
}
```

### Table Output

```json
{
  "blockId": "blk_code_1",
  "kind": "table",
  "columns": ["name", "score"],
  "rows": [
    ["A", 10],
    ["B", 20]
  ]
}
```

### Chart Output

```json
{
  "blockId": "blk_code_1",
  "kind": "chart",
  "chartType": "bar",
  "data": [
    { "label": "A", "value": 10 },
    { "label": "B", "value": 20 }
  ],
  "xKey": "label",
  "yKey": "value"
}
```

### Error Output

```json
{
  "blockId": "blk_code_1",
  "kind": "error",
  "name": "ReferenceError",
  "message": "x is not defined"
}
```

## Local Metadata Schema

Recommended per-notebook local metadata:

```json
{
  "notebookId": "nb_123",
  "lastLocalSaveAt": "2026-05-18T10:05:30.000Z",
  "lastOpenedAt": "2026-05-18T10:05:40.000Z",
  "hasUnsyncedChanges": true,
  "localChangeCounter": 14
}
```

Purpose:

- distinguish local editing status from durable sync state
- support ordering and recovery UX

## Sync Metadata Schema

Recommended sync metadata:

```json
{
  "notebookId": "nb_123",
  "baseRevision": 3,
  "lastSyncedRevision": 3,
  "lastSyncAt": "2026-05-18T10:00:10.000Z",
  "syncStatus": "unsynced"
}
```

Possible `syncStatus` values:

- `synced`
- `unsynced`
- `syncing`
- `conflict`
- `error`

## Open Questions

- whether notebook list items should duplicate part of title and timestamps from the canonical notebook schema or use a smaller list DTO
- whether chart outputs need a stricter typed series model in V1
- whether local metadata should record a content hash for faster dirty detection
- whether outputs should support a lightweight persisted local cache even though they are not durable notebook state
