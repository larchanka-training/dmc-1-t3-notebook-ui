# Архитектура runtime

> Неканонический русскоязычный companion. Каноническая версия: [runtime_architecture.md](./runtime_architecture.md).

## Назначение

Рекомендуемая модель выполнения JavaScript на frontend для Version 1.

Фиксировано: client-side execution, frontend orchestration, isolated execution.

## Где и как выполняется JavaScript

В браузере, вне main UI thread.

- orchestration — frontend application
- execution — dedicated `Web Worker`
- worker владеет execution session state boundary

Баланс: сложность, отзывчивость, изоляция от React UI thread.

## Worker vs iframe

### Рекомендация Version 1

`Web Worker` как primary runtime.

### Не рекомендуется на stage 1

`iframe` как primary runtime — сложнее DOM boundaries и exposure capabilities.

## Session lifecycle

### Start

Первый run создаёт session; worker инициализирует notebook runtime boundary для этой session.

### Reuse

Следующие runs в том же notebook переиспользуют session; variables/functions остаются доступны в рамках текущей runtime implementation model.

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

## Семантика хранения outputs

Version 1 frontend state должен хранить execution outputs по `blockId` как `outputs of latest run`.

Рекомендуемая семантика:

- `outputs[blockId]` — это упорядоченный массив normalized outputs, полученных в последнем запуске этого блока
- новый запуск блока заменяет предыдущий latest-run массив, а не дописывает данные в session-wide history
- порядок элементов массива должен соответствовать порядку прихода normalized runtime messages
- отсутствие `outputs[blockId]` означает, что у блока ещё нет результата latest run
- существующий, но пустой `outputs[blockId]` означает, что latest run уже стартовал, но outputs ещё не пришли
- `text` blocks не получают output entries

Такая модель сохраняет совместимость Stage 5 store с будущими multi-message outputs, но не превращает execution store в durable или session-wide event log.

## Security boundaries

Notebook code — untrusted.

- нет доступа к React internals
- mutation app state только через normalized messages
- нет backend credentials и raw session cookie

### Дополнительные ограничения

- не expose app stores и persistence adapters в worker
- минимальный runtime bridge API

## Runtime bridge messages

Рекомендуемые категории сообщений разделяются по направлению.

App -> worker:

- `RUN_BLOCKS`
- `RESET_SESSION`
- `TERMINATE_SESSION`

Worker -> app:

- `execution-started`
- `execution-output`
- `execution-error`
- `execution-complete`

Runtime messages также должны нести run-scoped identifier, например `executionId`.

Зачем это нужно:

- чтобы stale worker messages от terminate/replaced worker не меняли текущее execution state
- чтобы store мог игнорировать outputs и errors, относящиеся к старому run после `stop`, `reset`, timeout или быстрого повторного запуска

## Примечание о текущем MVP

Текущая реализация worker bridge уже покрывает:

- typed runtime protocol
- worker spawn/terminate lifecycle
- session reuse для последовательных `run current` и `run from selected`
- reset перед `run all`
- timeout-driven terminate и recreate behavior
- notebook-order sequencing в execution orchestrator для `run current`, `run all` и `run from selected`

Сам worker bridge при этом остается transport и lifecycle infrastructure.

Выбор диапазона блоков в notebook остается ответственностью execution orchestrator, а не worker.

Текущее ограничение реализации:

- runtime сейчас восстанавливает поведение session через replay ранее выполненных source blocks, а не через true live lexical scope
- этого достаточно для текущего Stage 5 MVP, но такой подход может повторно проигрывать upstream side effects и отличается от long-lived kernel model
- план перехода от replay-based session restoration к live worker session описан в `docs/plans/06-live-worker-session-transition-plan.md`

## Open questions

- console capture API в V1
- переход latest-run output arrays к richer console или streaming model в будущих версиях
- `fetch` из notebook code vs runtime policy
- chart objects vs helper API
- будущий iframe DOM runtime
