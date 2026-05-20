# Схема notebook

> Неканонический русскоязычный companion. Каноническая версия: [notebook_schema.md](./notebook_schema.md).

## Назначение

Рабочая frontend-схема канонической notebook JSON model для Version 1.

Планирование; позже выровнять с backend contracts.

## Canonical Notebook JSON

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

## Поля уровня notebook

### Required

`id`, `title`, `blocks`, `revision`, `createdAt`, `updatedAt`

### Notes

- `revision` — последняя известная client durable server revision
- порядок blocks — порядок массива
- V1 без дополнительных block layout metadata

## Block schemas

Общие поля: `id`, `type`, `content`; опционально `meta` в будущем.

### Text block

- `type` = `text`
- `content.markdown` — editable source of truth

### Code block

- `type` = `code`
- `language` = `javascript` в V1
- `content.source` — редактируемый код после AI updates

## Output schemas

Outputs — не durable blocks, а execution artifacts по `blockId`.

Envelope: `blockId`, `kind`, `producedAt`, `sessionId`.

Kinds: `text`, `object`, `table`, `chart`, `error` — см. JSON-примеры в [notebook_schema.md](./notebook_schema.md).

## Local metadata

```json
{
  "notebookId": "nb_123",
  "lastLocalSaveAt": "2026-05-18T10:05:30.000Z",
  "lastOpenedAt": "2026-05-18T10:05:40.000Z",
  "hasUnsyncedChanges": true,
  "localChangeCounter": 14
}
```

Отделяет local editing status от durable sync state.

## Sync metadata

```json
{
  "notebookId": "nb_123",
  "baseRevision": 3,
  "lastSyncedRevision": 3,
  "lastSyncAt": "2026-05-18T10:00:10.000Z",
  "syncStatus": "unsynced"
}
```

`syncStatus`: `synced`, `unsynced`, `syncing`, `conflict`, `error`.

## Open questions

- list DTO vs полный notebook schema
- stricter chart series model в V1
- content hash для dirty detection
- lightweight local cache outputs
