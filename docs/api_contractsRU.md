# API-контракты

> Неканонический русскоязычный companion. Каноническая версия: [api_contracts.md](./api_contracts.md).

## Назначение

Черновик frontend-facing API contracts для реализации UI Version 1.

Должны быть выровнены с backend и OpenAPI.

## Соглашения

- base path: `/api/v1`
- transport: `HTTP + JSON`
- auth state: backend-managed secure `HTTP-only` session cookie

## Auth endpoints

### `POST /api/v1/auth/email/request-otp`

Запрос OTP на email.

Request / Response — см. [api_contracts.md](./api_contracts.md).

Local/dev: backend может возвращать OTP details в dev.

### `POST /api/v1/auth/email/verify-otp`

Проверка OTP; response с `authenticated` и `user`.

### `GET /api/v1/auth/google/start`

Старт Google OAuth — browser navigation/redirect.

### `GET /api/v1/auth/session`

Текущая session summary.

### `POST /api/v1/auth/logout`

`status: logged_out`.

## Notebook list и detail

### `GET /api/v1/notebooks`

Query: `q` (optional). Response: `items[]` с `id`, `title`, `revision`, `updatedAt`.

### `POST /api/v1/notebooks`

Create с `title`; response — новый notebook metadata.

### `GET /api/v1/notebooks/:notebookId`

Полный canonical notebook с `blocks[]`.

## Sync

### `POST /api/v1/notebooks/:notebookId/sync`

Request: `baseRevision`, полный `notebook` snapshot.

**Success:** `status: synced`, новая `revision`, `updatedAt`.

**Conflict:** `status: conflict`, `serverRevision`, `serverNotebook` — без automatic merge.

JSON-примеры — в [api_contracts.md](./api_contracts.md).

## AI

### `POST /api/v1/ai/generate-block-code`

Request: `notebookId`, `blockId`, `prompt`, `context` (preceding blocks).

Response: `status: ok`, `code` string.

Error DTO: `status: error`, `code`, `message`.

## DTO examples

См. английский документ: Notebook List Item, Session, AI Error.

## Open questions

- exact backend route names
- create returns full notebook vs list item DTO
- sync success returns full notebook или только revision
- scope AI context payload
- logout `POST` vs `DELETE`
