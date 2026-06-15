# API Contracts

## Purpose

This document defines the draft frontend-facing API contracts required for Version 1 UI implementation.

These contracts must later align with backend implementation and OpenAPI.

## Conventions

- base path: `/api/v1`
- transport: `HTTP + JSON`
- auth state: backend-managed secure `HTTP-only` session cookie

## Auth Endpoints

### `POST /api/v1/auth/email/request-otp`

Purpose:

- request an OTP for an email address

Request:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "status": "otp_requested"
}
```

Local/dev note:

- the backend architecture allows dev responses to include OTP details in local development

### `POST /api/v1/auth/email/verify-otp`

Request:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:

```json
{
  "status": "authenticated",
  "user": {
    "id": "usr_1",
    "email": "user@example.com"
  }
}
```

### `GET /api/v1/auth/google/start`

Purpose:

- start Google OAuth flow

Frontend expectation:

- browser navigation or redirect

### `GET /api/v1/auth/session`

Purpose:

- fetch current authenticated session summary

Response:

```json
{
  "authenticated": true,
  "user": {
    "id": "usr_1",
    "email": "user@example.com"
  }
}
```

### `POST /api/v1/auth/logout`

Response:

```json
{
  "status": "logged_out"
}
```

## Notebook List And Detail Endpoints

### `GET /api/v1/notebooks`

Query parameters:

- `q` optional search query

Response:

```json
{
  "items": [
    {
      "id": "nb_123",
      "title": "Example notebook",
      "revision": 3,
      "updatedAt": "2026-05-18T10:05:00.000Z"
    }
  ]
}
```

### `POST /api/v1/notebooks`

Request:

```json
{
  "title": "New notebook"
}
```

Response:

```json
{
  "id": "nb_124",
  "title": "New notebook",
  "revision": 1,
  "createdAt": "2026-05-18T11:00:00.000Z",
  "updatedAt": "2026-05-18T11:00:00.000Z"
}
```

### `GET /api/v1/notebooks/:notebookId`

Response:

```json
{
  "id": "nb_123",
  "title": "Example notebook",
  "tags": ["reference", "demo"],
  "blocks": [
    {
      "id": "blk_1",
      "type": "text",
      "content": {
        "markdown": "# Title"
      },
      "meta": {
        "tags": ["intro", "summary"]
      }
    }
  ],
  "revision": 3,
  "createdAt": "2026-05-18T10:00:00.000Z",
  "updatedAt": "2026-05-18T10:05:00.000Z"
}
```

## Sync Request And Response

### `POST /api/v1/notebooks/:notebookId/sync`

Request:

```json
{
  "baseRevision": 3,
  "notebook": {
    "id": "nb_123",
    "title": "Example notebook",
    "tags": ["reference", "demo"],
    "blocks": [
      {
        "id": "blk_1",
        "type": "text",
        "content": {
          "markdown": "# Updated title"
        },
        "meta": {
          "tags": ["intro", "summary"]
        }
      }
    ]
  }
}
```

Success response:

```json
{
  "status": "synced",
  "revision": 4,
  "updatedAt": "2026-05-18T10:10:00.000Z"
}
```

Conflict response:

```json
{
  "status": "conflict",
  "serverRevision": 5,
  "serverNotebook": {
    "id": "nb_123",
    "title": "Server version",
    "tags": ["reference", "server"],
    "blocks": []
  }
}
```

## AI Block Request And Response

### `POST /api/v1/ai/generate-block-code`

Request:

```json
{
  "notebookId": "nb_123",
  "blockId": "blk_2",
  "prompt": "Load data from an API and print the result",
  "context": {
    "title": "Example notebook",
    "blocksBeforeTarget": [
      {
        "id": "blk_1",
        "type": "text",
        "content": {
          "markdown": "We need to fetch data."
        }
      }
    ]
  }
}
```

Response:

```json
{
  "status": "ok",
  "code": "const response = await fetch('https://example.com/data');\nconst data = await response.json();\nconsole.log(data);"
}
```

## Exact DTO Examples

### Notebook List Item DTO

```json
{
  "id": "nb_123",
  "title": "Revenue summary",
  "revision": 8,
  "updatedAt": "2026-05-18T10:05:00.000Z"
}
```

### Session DTO

```json
{
  "authenticated": true,
  "user": {
    "id": "usr_1",
    "email": "user@example.com"
  }
}
```

### AI Error DTO

```json
{
  "status": "error",
  "code": "AI_PROVIDER_TIMEOUT",
  "message": "The AI request timed out."
}
```

## Open Questions

- exact feature route names in backend implementation
- whether notebook create returns a full notebook or list item DTO
- whether sync should return the full canonical notebook after success
- whether AI context payload should include only preceding code blocks or a broader notebook summary
- whether logout is `POST` or `DELETE`
