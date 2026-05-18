# ADR-006: API Client Strategy

## Status

Accepted

## Decision

Use a thin custom API client plus `@tanstack/react-query` for server-state lifecycle management.

## Context

The app has clear backend boundaries for auth, notebooks, sync, and AI, but editor state must remain local and product-specific.

## Rationale

- custom client keeps request details explicit
- React Query handles async caching, retries, and loading state for server data
- avoids pushing notebook editor state into server-state infrastructure

## Consequences

- editor state remains in Zustand
- API DTO validation should use shared schemas or mappers at the boundary
