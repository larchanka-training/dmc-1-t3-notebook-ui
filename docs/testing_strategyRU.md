# Стратегия frontend-тестирования

> Неканонический русскоязычный companion. Каноническая версия: [testing_strategy.md](./testing_strategy.md).

## Назначение

Frontend-стратегия тестирования для репозитория `ui`.

Дополняет monorepo-level [qa_plan.md](../../docs/qa_plan.md).

## Test stack

- `Vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `MSW`
- `Playwright`

## Слои тестирования

### Unit

Чистая логика: порядок blocks, dirty state, sync state mapping, output normalization, schema validation.

### UI Integration

Pages и features: login states, list states, block toolbar, AI prompt visibility, sync conflict display, output binding.

### E2E

Критичные потоки: routes, create notebook, edit blocks, reload local copy, run blocks, explicit sync.

## Карта покрытия по итерациям

| Итерация | Что тестировать                                     |
| -------- | --------------------------------------------------- |
| 1        | app boot, route rendering, fallback                 |
| 2        | loading/empty/success/error, navigation             |
| 3        | add/delete/move blocks, edit text/code              |
| 4        | IndexedDB save/restore, unsynced markers            |
| 5        | run block/all/from, session, timeout/cancel, errors |
| 6        | AI prompt lifecycle, proposal insertion             |
| 7        | sync success/failure/conflict, conflict actions     |
| 8        | MSW contract flows, realistic API responses         |

## Минимальный E2E pack

- login, list, editor routes render
- create local notebook
- add/edit blocks
- reload и recovery local state
- simple code execution flow

## Что не пере-тестировать рано

- snapshot всей страницы
- visual regression до стабилизации UI
- E2E на каждое component state

## Обязательная верификация перед завершением

1. lint
2. typecheck
3. unit tests
4. UI integration tests
5. build
6. Playwright smoke для user-critical flows
