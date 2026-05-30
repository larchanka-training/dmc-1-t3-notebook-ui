# ADR-004: Библиотека графиков

> Неканонический русскоязычный companion. Каноническая версия: [ADR-004-chart-library.md](./ADR-004-chart-library.md).

## Status

Accepted

## Decision

Использовать `Recharts` `2.15.3` для output type `chart`.

## Context

Charts обязательны в Version 1, advanced authoring — нет.

## Rationale

- достаточно для простых chart DTO
- проще тяжёлых charting platform
- совпадает с envelope в `notebook_schema.md`

## Consequences

- простые DTO (`chartType`, `data`, `xKey`, `yKey`)
- рендер рядом с output, не как notebook block
