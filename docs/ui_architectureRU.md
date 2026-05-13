# Архитектура UI

## 1. Назначение

Этот документ определяет архитектуру frontend-приложения.

В нем фиксируются:

- frontend routing model
- основные UI-экраны
- layout редактора notebook
- модель взаимодействия на уровне блоков
- архитектура frontend-state
- связь UI с local storage, execution, backend и AI
- зафиксированные frontend-технологические решения для Version 1

## 2. Зафиксированные решения для Version 1

Для Version 1 зафиксированы следующие UI-решения:

1. Приложение использует три маршрута:
   - `/login`
   - `/notebooks`
   - `/notebooks/:notebookId`
2. Frontend-state управляется через `Zustand`.
3. Text blocks редактируются как `Markdown`.
4. Code blocks редактируются через `CodeMirror`.
5. Notebook editor использует вертикальный document layout.
6. AI flow привязан к блоку и работает только в контексте выбранного code block.
7. Block action cluster показывается рядом с блоком и содержит:
   - trigger block toolbar
   - AI action
   - run/stop action
8. Типы output:
   - `text`
   - `object`
   - `table`
   - `chart`
   - `error`
9. Изображения не являются block type в Version 1.
10. Поддержка рендеринга изображений не входит в UI-архитектуру Version 1.
11. Точка входа в аутентификацию поддерживает и `Email + OTP`, и `Google OAuth`.

## 3. Роль frontend в системе

Frontend-приложение отвечает за:

- UI аутентификации
- UI запуска входа через Google
- UI списка notebook
- UI редактора notebook
- редактирование блоков
- порядок блоков и block-level actions
- execution controls и execution feedback
- рендеринг output
- ввод AI-prompts для выбранного code block
- интеграцию с локальной персистентностью
- отображение состояния синхронизации и действия синхронизации

Frontend владеет активной рабочей копией notebook во время редактирования.

## 4. Routing Model

Frontend routing model:

### 4.1 `/login`

Назначение:

- ввод email пользователя
- ввод OTP
- запуск входа через Google
- переход пользователя в аутентифицированное состояние

### 4.2 `/notebooks`

Назначение:

- показать список notebook пользователя
- создать notebook
- открыть notebook

### 4.3 `/notebooks/:notebookId`

Назначение:

- открыть notebook editor
- загрузить активную рабочую копию notebook
- редактировать блоки
- запускать notebook-код
- выполнять sync
- использовать AI для block-level code updates

## 5. Структура экранов

### 5.1 Login Screen

Login screen содержит:

- input email
- submit action для запроса OTP
- input OTP
- submit action для проверки OTP
- action входа через Google
- request status feedback
- authentication error feedback

### 5.2 Notebook List Screen

Notebook list screen содержит:

- page header
- action создания notebook
- список notebook
- item actions там, где нужно
- loading state
- empty state
- error state

### 5.3 Notebook Editor Screen

Notebook editor screen содержит:

- верхнюю панель notebook actions
- центральный вертикальный список blocks
- block-level action cluster рядом с каждым блоком
- block content area
- block output area для исполняемых блоков
- индикатор sync-state

Notebook editor screen не содержит глобального AI workspace в Version 1.

## 6. Layout редактора notebook

Notebook editor использует `notion-like` вертикальный reading and editing flow.

Структура layout:

1. верхняя action bar
2. область notebook metadata там, где она нужна
3. упорядоченная вертикальная последовательность blocks
4. block-local output, напрямую привязанный к соответствующему code block

Верхняя action bar содержит notebook-level actions:

- отображение или редактирование названия notebook
- action синхронизации
- action запуска всех блоков
- action экспорта
- navigation actions там, где они нужны

Layout не использует постоянный split-view или постоянную global side panel в Version 1.

## 7. Block model в UI

Frontend поддерживает два типа блоков:

- `text`
- `code`

Каждый отображаемый block содержит:

- block container
- block action cluster
- block content area
- block-specific UI state

Code blocks дополнительно содержат:

- code editor
- run/stop control
- AI action
- output area

Text blocks содержат:

- область редактирования Markdown

## 8. Block Action Cluster

Рядом с каждым block отображается block action cluster.

Cluster содержит:

1. `Block toolbar trigger`
   Открывает block actions:
   - add block above
   - add block below
   - delete block
   - move block up
   - move block down

2. `AI action`
   Открывает AI prompt UI для выбранного code block.

3. `Run/Stop action`
   Запускает выполнение или останавливает текущий execution flow, когда это применимо.

Action cluster является локальным для блока, а не notebook-global control area.

## 9. Редактирование text block

Text blocks редактируются как `Markdown`.

Text editing в Version 1 использует Markdown-oriented editing surface.

UI text block поддерживает:

- ввод обычного текста
- ввод Markdown syntax
- обычные операции редактирования текстового блока

Version 1 не включает rich text editor.

## 10. Редактирование code block

Code blocks редактируются через `CodeMirror`.

UI code block поддерживает:

- редактирование исполняемого `JavaScript`
- сохранение code content как части notebook-блока
- block-level execution actions
- AI-assisted replacement или refinement кода

Code editor является частью блока, а не отдельным IDE workspace.

## 11. Рендеринг output

Output рендерится в контексте code block, который этот output породил.

Поддерживаемые output types в Version 1:

- `text`
- `object`
- `table`
- `chart`
- `error`

Output показывается непосредственно под или рядом с content area соответствующего code block внутри его контекста.

Output не моделируется как отдельный notebook block type.

## 12. AI User Flow

AI flow привязан к блоку.

Frontend AI interaction model:

1. Пользователь выбирает целевой code block.
2. Пользователь нажимает AI action блока.
3. Frontend открывает prompt input UI для этого блока.
4. Пользователь вводит prompt.
5. Frontend отправляет prompt и релевантный notebook context через backend AI endpoint.
6. Frontend получает сгенерированный код.
7. Frontend вставляет сгенерированный код в выбранный code block как proposed update.
8. Пользователь подтверждает, редактирует или заменяет вставленный код.

Version 1 не включает:

- global AI editor
- отдельную AI chat page
- notebook-wide detached AI authoring workflow

## 13. Execution User Flow

Frontend поддерживает следующие execution actions:

- run current block
- stop current running execution flow, когда это применимо
- run all blocks
- run from selected block

Execution UI отвечает за:

- передачу execution commands в execution orchestrator
- отображение running state
- отображение успешных и ошибочных результатов
- привязку outputs к правильному блоку

Execution UI использует block-level и notebook-level controls, а не detached console-first workflow.

## 14. Локальная персистентность и Sync UX

Frontend интегрирует локальную персистентность и явную синхронизацию.

UI отвечает за:

- хранение активной рабочей копии notebook локально
- маркировку notebook при наличии unsynced changes
- явную пользовательскую action синхронизации
- отображение sync-state
- отображение sync conflict state, если его возвращает backend

Version 1 не скрывает синхронизацию за silent always-on merge model.

## 15. Архитектура frontend-state

Frontend application state управляется через `Zustand`.

Frontend-state разделен на следующие логические области:

### 15.1 Auth State

Содержит:

- authentication status
- осведомленность о текущей user session
- login flow state
- OTP flow UI state
- Google sign-in flow state

### 15.2 Notebook List State

Содержит:

- notebook list data
- notebook list loading state
- notebook list error state

### 15.3 Active Notebook State

Содержит:

- identity активного notebook
- notebook metadata
- ordered blocks
- local working copy state
- dirty или unsynced markers

### 15.4 Block UI State

Содержит:

- selected block
- focused block
- видимость block toolbar
- block-local editing UI state
- видимость AI prompt для блока

### 15.5 Execution State

Содержит:

- current execution status
- current execution target
- running block markers
- execution error state
- block output bindings

### 15.6 Sync State

Содержит:

- markers последнего синхронизированного состояния
- sync in-progress state
- sync success state
- sync conflict state
- sync error state

### 15.7 App UI State

Содержит:

- global loading indicators там, где они нужны
- transient notifications
- page-level UI state

## 16. Границы потоков данных

Frontend взаимодействует со следующими частями системы:

### 16.1 Backend API

Используется для:

- аутентификации
- загрузки списка notebook
- получения notebook
- синхронизации notebook
- AI-запросов

### 16.2 Local Storage

Используется для:

- персистентности локальной рабочей копии notebook
- восстановления после reload
- локальных sync-метаданных

### 16.3 Execution Orchestrator

Используется для:

- run block
- run from block
- run all
- stop execution

### 16.4 Execution Runtime

Используется косвенно через execution orchestrator для:

- изолированного выполнения `JavaScript`
- формирования output
- хранения execution session state

## 17. Error и Empty States

Frontend должен явно рендерить:

- login error state
- notebook list empty state
- notebook list error state
- notebook load error state
- block execution error state
- sync error state
- sync conflict state
- AI request error state

Эти состояния являются частью архитектуры, а не необязательной визуальной полировкой.

## 18. UI-функции вне Version 1

Следующие UI-функции не входят в Version 1:

- rich text editor
- image block type
- рендеринг изображений внутри blocks
- global AI workspace
- real-time collaborative editing UI
- inline review comment system
- multi-pane IDE-like workspace

## 19. Связанные документы

- [system_architectureRU.md](../../docs/system_architectureRU.md)
- [tech_stackRU.md](../../docs/tech_stackRU.md)
- [projectRU.md](../../docs/projectRU.md)
