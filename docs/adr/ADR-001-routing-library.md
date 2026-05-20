# ADR-001: Routing Library

## Status

Accepted

## Decision

Use `react-router-dom` `7.8.2` with the React Router data APIs:

- `createBrowserRouter`
- `RouterProvider`
- `RouteObject` route tables
- layout routes with `Outlet`
- auth guards with `Navigate` and nested routes

## Context

The application has a fixed Version 1 route model:

- `/login`
- `/notebooks`
- `/notebooks/:notebookId`

The UI already uses the data-router pattern in `src/app/routes.tsx` and `src/App.tsx`.

## Rationale

- standard React ecosystem choice
- suitable for route-level layout, guards, and redirects
- sufficient for Version 1 complexity
- version 7 aligns with current React 18 usage and future route-level data loading if needed

## Consequences

- route definitions stay explicit and centralized under `app/router/`
- page-level loading and redirect logic can be implemented cleanly
- upgrading from React Router 6 to 7 is complete in `package.json`; new code should target v7 APIs only

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §5
- [libs.md](../libs.md)
