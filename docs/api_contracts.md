# API Contracts

## Purpose

This document defines the draft frontend-facing API contracts required for Version 1 UI implementation.

These contracts must later align with backend implementation and OpenAPI.

For auth and notebook persistence, the canonical backend sources of truth are:

- `api/docs/auth.md`
- `api/docs/persistence.md`

For the AI route, the canonical backend source of truth is:

- `api/docs/ai_contract.md`

This document describes the frontend-facing interpretation of that backend contract.

## Conventions

- base path: `/api/v1`
- transport: `HTTP + JSON`
- auth state: backend-managed secure `HTTP-only` session cookie

## Auth Endpoints

### `POST /api/v1/auth/request-otp`

Purpose:

- request an OTP for an email address

Request:

```json
{
  "email": "user@example.com"
}
```

Success response:

```json
{
  "challenge_id": "otp_ch_123",
  "expires_in_seconds": 300,
  "dev_otp": "123456"
}
```

Local/dev note:

- `dev_otp` is allowed only in explicit local/dev environments
- frontend must not depend on `dev_otp` outside local/dev flows

### `POST /api/v1/auth/verify-otp`

Request:

```json
{
  "challenge_id": "0f1b9d40-59d8-4d77-b90d-2e0bcedd91b5",
  "otp_code": "123456"
}
```

Response:

```json
{
  "user": {
    "id": "0f1b9d40-59d8-4d77-b90d-2e0bcedd91b5",
    "email": "user@example.com",
    "display_name": null
  },
  "authenticated_at": "2026-05-14T10:00:00Z"
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
    "id": "0f1b9d40-59d8-4d77-b90d-2e0bcedd91b5",
    "email": "user@example.com",
    "display_name": null
  }
}
```

Anonymous response:

```json
{
  "authenticated": false,
  "user": null
}
```

### `POST /api/v1/auth/logout`

Response:

```json
{
  "logged_out": true
}
```

## Notebook List And Detail Endpoints

### `GET /api/v1/notebooks`

Response:

```json
{
  "items": [
    {
      "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
      "title": "Example notebook",
      "revision": 3,
      "updated_at": "2026-05-18T10:05:00Z"
    }
  ]
}
```

Frontend note:

- the canonical persistence contract uses an `items[]` wrapper here
- if current backend implementation temporarily returns a plain array, treat that as contract drift to be aligned rather than as the long-term frontend contract

### `POST /api/v1/notebooks`

Request:

```json
{
  "title": "New notebook",
  "content_snapshot": {
    "id": null,
    "title": "New notebook",
    "tags": [],
    "blocks": [],
    "metadata": {
      "version": 1
    }
  }
}
```

Response:

```json
{
  "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
  "title": "New notebook",
  "revision": 1,
  "created_at": "2026-05-18T11:00:00Z",
  "updated_at": "2026-05-18T11:00:00Z",
  "content_snapshot": {
    "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
    "title": "New notebook",
    "tags": [],
    "blocks": [],
    "metadata": {
      "version": 1
    }
  }
}
```

### `GET /api/v1/notebooks/:notebookId`

Response:

```json
{
  "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
  "title": "Example notebook",
  "revision": 3,
  "created_at": "2026-05-18T10:00:00Z",
  "updated_at": "2026-05-18T10:05:00Z",
  "content_snapshot": {
    "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
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
    "metadata": {
      "version": 1
    }
  }
}
```

Access note:

- requests for notebooks not owned by the authenticated user should be handled as `404 Not Found` per `api/docs/persistence.md`

### `PATCH /api/v1/notebooks/:notebookId`

Purpose:

- rename notebook metadata without sync semantics

Request:

```json
{
  "title": "Renamed notebook"
}
```

Response:

- full notebook response shape or a smaller metadata response

### `DELETE /api/v1/notebooks/:notebookId`

Purpose:

- delete one of the current user's notebooks

Response:

- `204 No Content`

## Sync Request And Response

### `POST /api/v1/notebooks/:notebookId/sync`

Status note:

- this is a target frontend-facing contract aligned with `api/docs/persistence.md`
- the sync route is documented contractually even if it is not yet fully implemented in the current repository state

Request:

```json
{
  "base_revision": 3,
  "content_snapshot": {
    "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
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
  "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
  "revision": 4,
  "updated_at": "2026-05-18T10:10:00Z",
  "content_snapshot": {
    "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
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
    ],
    "metadata": {
      "version": 1
    }
  }
}
```

Conflict response:

```json
{
  "error": {
    "code": "notebook_sync_conflict",
    "message": "The notebook was updated on the server."
  },
  "server_revision": 5
}
```

Frontend note:

- backend may later optionally include the current server snapshot in the conflict response
- otherwise frontend should re-fetch `GET /api/v1/notebooks/:notebookId`

## AI Block Request And Response

### `POST /api/v1/ai/code-blocks/generate`

Purpose:

- request block-scoped AI code generation or revision through the canonical backend AI path

Frontend notes:

- the source block must be a `text` block
- `mode: "revise"` still uses a `text` source block after the convert-code-to-text flow
- the backend returns proposed code only; frontend remains responsible for insertion

Request:

```json
{
  "notebookId": "nb_123",
  "sourceBlockId": "blk_text_2",
  "mode": "generate",
  "prompt": "Load data from an API and print the result.",
  "context": {
    "language": "javascript",
    "scope": "this",
    "sourceText": "Load data from an API and print the result.",
    "notebookTitle": "Example notebook",
    "globalsSummary": ["apiBaseUrl"],
    "relevantBlocks": [
      {
        "blockId": "blk_text_1",
        "type": "text",
        "content": "We need to fetch data."
      }
    ]
  },
  "insertionStrategy": "next-empty-or-new-after-source"
}
```

Field summary:

- `notebookId`: notebook identifier
- `sourceBlockId`: source `text` block identifier
- `mode`: `generate` or `revise`
- `prompt`: non-empty code-generation or code-revision prompt
- `context.language`: must be `javascript`
- `context.scope`: `this` or `notebook`; frontend default is `this`
- `insertionStrategy`: fixed Version 1 value `next-empty-or-new-after-source`

Success response:

```json
{
  "requestId": "air_20260618_0001",
  "status": "success",
  "code": "const response = await fetch(apiBaseUrl);\nconst data = await response.json();\nconsole.log(data);",
  "provider": {
    "name": "bedrock",
    "model": "deepseek.v3.2"
  },
  "validation": {
    "extractionApplied": true,
    "syntaxOk": true,
    "repairAttempts": 0
  },
  "warnings": []
}
```

Frontend handling notes:

- insert `code` into the next empty `code` block after the source block, or create a new `code` block there
- keep prompt draft intact when the request fails
- treat `warnings[]` as user-displayable non-fatal notices

Normalized backend error response:

```json
{
  "requestId": "air_20260618_0001",
  "status": "error",
  "errorCode": "AI_PROVIDER_TIMEOUT",
  "message": "The AI provider did not respond in time. Try again.",
  "retryable": true
}
```

Frontend error mapping notes:

- `401` unauthenticated is handled by the shared auth/session flow and is not a normalized AI `errorCode`
- `AI_INVALID_REQUEST`, `AI_FORBIDDEN`, `AI_PROMPT_REJECTED`, and `AI_PROMPT_UNSAFE` are non-retryable
- `AI_PROVIDER_UNAVAILABLE`, `AI_PROVIDER_TIMEOUT`, `AI_RESPONSE_INVALID`, `AI_CODE_EXTRACTION_FAILED`, and `AI_CODE_SYNTAX_INVALID` are retryable
- `AI_FALLBACK_UNAVAILABLE` is frontend-local only and is not returned by this backend route

## Exact DTO Examples

### Notebook List Item DTO

```json
{
  "id": "7e7c6d72-124d-40db-8c03-42f0eab1f451",
  "title": "Revenue summary",
  "revision": 8,
  "updated_at": "2026-05-18T10:05:00Z"
}
```

### Session DTO

```json
{
  "authenticated": true,
  "user": {
    "id": "0f1b9d40-59d8-4d77-b90d-2e0bcedd91b5",
    "email": "user@example.com",
    "display_name": null
  }
}
```

### AI Error DTO

```json
{
  "requestId": "air_20260618_0001",
  "status": "error",
  "errorCode": "AI_PROVIDER_TIMEOUT",
  "message": "The AI provider did not respond in time. Try again.",
  "retryable": true
}
```

## Open Questions

- whether logout is `POST` or `DELETE`
