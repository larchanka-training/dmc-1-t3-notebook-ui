# API-контракты

> Неканонический русскоязычный companion. Каноническая версия: [api_contracts.md](./api_contracts.md).

## Назначение

Черновик frontend-facing API contracts для реализации UI Version 1.

Должны быть выровнены с backend и OpenAPI.

Для AI route канонический backend source of truth:

- `api/docs/ai_contract.md`

Этот документ фиксирует frontend-facing interpretation этого backend contract.

Для auth и notebook persistence канонические backend sources of truth:

- `api/docs/auth.md`
- `api/docs/persistence.md`

## Соглашения

- base path: `/api/v1`
- transport: `HTTP + JSON`
- auth state: backend-managed secure `HTTP-only` session cookie

## Auth endpoints

### `POST /api/v1/auth/request-otp`

Запрос OTP на email.

Request: `email`.

Success response:

- `challenge_id`
- `expires_in_seconds`
- optional `dev_otp` только в local/dev

Local/dev: backend может возвращать OTP details в dev.

### `POST /api/v1/auth/verify-otp`

Проверка OTP.

Request:

- `challenge_id`
- `otp_code`

Success response:

- `user`
- `authenticated_at`

### `GET /api/v1/auth/google/start`

Старт Google OAuth — browser navigation/redirect.

### `GET /api/v1/auth/session`

Текущая session summary.

Возможны два success-состояния:

- `authenticated: true`, `user`
- `authenticated: false`, `user: null`

### `POST /api/v1/auth/logout`

`logged_out: true`.

## Notebook list и detail

### `GET /api/v1/notebooks`

Response: wrapper `items[]`, не plain array.

### `POST /api/v1/notebooks`

Create с `title` и `content_snapshot`; response — full notebook response shape.

### `GET /api/v1/notebooks/:notebookId`

Полный canonical notebook response с `content_snapshot`.

Важно:

- inaccessible private notebook должен трактоваться как `404 Not Found`

### `PATCH /api/v1/notebooks/:notebookId`

Rename metadata without sync semantics.

### `DELETE /api/v1/notebooks/:notebookId`

Success: `204 No Content`.

## Sync

### `POST /api/v1/notebooks/:notebookId/sync`

Target contract, даже если route ещё не полностью реализован в текущем state.

Request:

- `base_revision`
- `content_snapshot`

**Success:** full notebook response shape with updated `revision` and `content_snapshot`.

**Conflict:** `409` с `error.code = notebook_sync_conflict` и `server_revision`; без automatic merge.

JSON-примеры — в [api_contracts.md](./api_contracts.md).

## AI

### `POST /api/v1/ai/code-blocks/generate`

Request:

- `notebookId`
- `sourceBlockId`
- `mode` = `generate` | `revise`
- `prompt`
- `context`
- `insertionStrategy`

Version 1 rules:

- source block должен быть `text`
- `context.language` должен быть `javascript`
- frontend default для `context.scope` это `this`
- `mode: "revise"` тоже использует `text` source block после convert-code-to-text flow
- `insertionStrategy` фиксирован как `next-empty-or-new-after-source`

Success response:

- `requestId`
- `status: "success"`
- `code`
- `provider`
- `validation`
- optional `warnings`

Error response:

- `requestId`
- `status: "error"`
- `errorCode`
- `message`
- `retryable`

Важно:

- `401` идёт через shared auth/session flow и не является normalized AI `errorCode`
- `AI_FALLBACK_UNAVAILABLE` не приходит с backend route; это frontend-local fallback state

## DTO examples

См. английский документ: Notebook List Item, Session, Notebook Detail, Sync, AI Success, AI Error.

## Open questions

- оставшиеся open questions смотреть в canonical backend docs; route names и AI route здесь уже зафиксированы
