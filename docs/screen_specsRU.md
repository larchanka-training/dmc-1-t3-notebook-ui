# Спецификации экранов

> Неканонический русскоязычный companion. Каноническая версия: [screen_specs.md](./screen_specs.md).

## Назначение

Ожидания к экранам Version 1 для frontend-маршрутов.

## `/login`

### Layout

- центрированная auth card/column
- форма email OTP
- состояние проверки OTP
- action входа через Google
- inline request и error messaging

### States

- initial
- requesting OTP
- OTP requested
- verifying OTP
- auth error
- authenticated redirect

### Actions

- ввод email, request OTP
- ввод OTP, verify OTP
- start Google sign-in

### Acceptance Criteria

- OTP request и submit
- видимый Google sign-in
- видимые loading и error feedback

## `/notebooks`

### Layout

- page header
- create notebook action
- search/filter (когда реализовано)
- область списка

### States

- loading, empty, error, success

### Actions

- create notebook, open notebook, search (когда реализовано)

### Acceptance Criteria

- feedback states списка
- создание и открытие notebook

## `/notebooks/:notebookId`

### Layout

- top notebook action bar
- область title
- sync status area
- вертикальный block list
- block-local action cluster
- output area у code blocks

### States

- loading, load error, empty notebook, populated
- execution running, syncing, sync conflict

### Actions

- edit title
- add/delete/move text и code blocks
- edit text/code
- run current / all / from selected, stop
- open AI prompt для code block
- sync notebook

### Acceptance Criteria

- vertical notion-like flow
- block actions локальны блоку
- output рядом с originating block
- видимый sync state
- AI entry block-scoped
