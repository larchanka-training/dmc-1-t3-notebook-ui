# ADR-001: Библиотека маршрутизации

> Неканонический русскоязычный companion. Каноническая версия: [ADR-001-routing-library.md](./ADR-001-routing-library.md).

## Status

Accepted

## Decision

Использовать `react-router-dom` `7.8.2` с data router API:

- `createBrowserRouter`
- `RouterProvider`
- `RouteObject`
- layout routes с `Outlet`
- auth guards через `Navigate`

## Context

Зафиксированные маршруты Version 1:

- `/login`
- `/notebooks`
- `/notebooks/:notebookId`

## Rationale

- стандарт для React ecosystem
- route-level layout, guards, redirects
- v7 соответствует текущему React 18 и будущему route-level data loading

## Consequences

- маршруты централизованы в `app/router/`
- новый код только под API v7
- пакет установлен в `package.json`
