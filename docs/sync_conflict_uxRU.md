# UX конфликта синхронизации

> Неканонический русскоязычный companion. Каноническая версия: [sync_conflict_ux.md](./sync_conflict_ux.md).

## Назначение

Явный UX конфликтов sync notebook в Version 1.

Архитектура фиксирует: manual sync, explicit conflict handling, no automatic merge.

## Что считается конфликтом

- sync request с `baseRevision = X`
- durable notebook на сервере уже продвинулся дальше `X`
- local working copy и server copy разошлись

## Обязательный conflict UI

Пользователь видит:

- статус `Sync conflict`
- local/base revision и server revision
- краткое объяснение, что automatic merge не выполнялся
- action buttons

Conflict state визуально сильнее обычной sync error.

## Действия пользователя (Version 1)

- `Review server version`
- `Keep local version for later`
- `Replace local with server version`
- `Retry after decision`

Опционально позже: `Export local version before overwrite`.

## Значение `baseRevision`

Последняя server revision, с которой local working copy была согласована при продолжении локальных правок.

Не является: счётчиком локальных правок или текущей server revision.

## Показ расхождения

Version 1 без полного automatic merge UI.

Показать: local/server title summary, updated time, block count.

Structured block-level diff — позже.

## Размещение на экране

`/notebooks/:notebookId`:

- conflict status в top action bar
- детальная панель inline или modal

Не прятать только в generic toast.

## Рекомендуемые формулировки

**Primary:** `This notebook has changed on the server since your local version was based on revision X. Automatic merge was not performed.`

**Supporting:** `Review the server version before deciding whether to overwrite or discard your local working copy.`

## Recovery paths

### Replace Local With Server

- discard local working copy
- load server notebook
- reset sync to synced

### Keep Local For Later

- сохранить local copy в IndexedDB
- сохранить conflict status
- не терять правки пользователя

### Retry After Decision

- только после явного выбора source of truth

## Вне Version 1

- automatic line merge
- Git-like merge editor
- collaborative merge resolution
