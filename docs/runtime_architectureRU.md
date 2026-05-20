# Архитектура runtime

> Неканонический русскоязычный companion. Каноническая версия: [runtime_architecture.md](./runtime_architecture.md).

## Назначение

Рекомендуемая модель выполнения JavaScript на frontend для Version 1.

Фиксировано: client-side execution, frontend orchestration, isolated execution.

## Где и как выполняется JavaScript

В браузере, вне main UI thread.

- orchestration — frontend application
- execution — dedicated `Web Worker`
- worker владеет execution session state

Баланс: сложность, отзывчивость, изоляция от React UI thread.

## Worker vs iframe

### Рекомендация Version 1

`Web Worker` как primary runtime.

### Не рекомендуется на stage 1

`iframe` как primary runtime — сложнее DOM boundaries и exposure capabilities.

## Session lifecycle

### Start

Первый run создаёт session; worker инициализирует persistent scope.

### Reuse

Следующие runs в том же notebook переиспользуют session; variables/functions сохраняются.

### Reset

- `run all` — reset session, затем run сверху вниз (рекомендация V1)
- `run current` / `run from selected` — reuse session, если reset не запрошен

### End

Закрытие страницы уничтожает in-memory session; session не durable notebook state.

## Timeout, cancelation, errors

### Timeout

Orchestrator отслеживает soft timeout; UI помечает timed out; worker terminate + новый clean worker.

### Cancelation

Stop terminate current worker; fresh worker для следующих runs; coarse-grained, не cooperative.

### Error normalization

```json
{
  "kind": "error",
  "name": "Error",
  "message": "Something failed",
  "stack": "optional stack string"
}
```

Категории: syntax, runtime thrown, timeout, canceled, internal bridge error.

## Output normalization

Bridge конвертирует worker messages в: `text`, `object`, `table`, `chart`, `error`.

Worker не отправляет произвольную UI markup.

## Security boundaries

Notebook code — untrusted.

- нет доступа к React internals
- mutation app state только через normalized messages
- нет backend credentials и raw session cookie

### Дополнительные ограничения

- не expose app stores и persistence adapters в worker
- минимальный runtime bridge API

## Runtime bridge messages

- `RUN_BLOCKS`
- `EXECUTION_RESULT`
- `EXECUTION_ERROR`
- `EXECUTION_COMPLETE`
- `RESET_SESSION`
- `TERMINATE_SESSION`

## Open questions

- console capture API в V1
- `fetch` из notebook code vs runtime policy
- chart objects vs helper API
- будущий iframe DOM runtime
