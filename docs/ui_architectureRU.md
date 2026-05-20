# Архитектура UI

## 1. Назначение

Этот документ определяет архитектуру frontend-приложения.

В нем фиксируются:

- frontend routing model
- основные UI-экраны
- layout редактора notebook
- модель взаимодействия на уровне блоков
- структура исходного кода по Feature-Sliced Design (FSD)
- границы public API между слайсами
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
12. Общие UI-примитивы — **shadcn/ui** (Radix + Tailwind) в `shared/ui/`, тема через design tokens.

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

## 4. Структура исходного кода (Feature-Sliced Design)

Код frontend в `ui/src/` организован по **Feature-Sliced Design (FSD)**.

В этом разделе зафиксированы каноническая модель слоёв FSD, правила public API и структура репозитория для Version 1.

Каноническая английская версия: [ui_architecture.md](./ui_architecture.md) §4.

### 4.1 Слои FSD

Слои упорядочены от оболочки приложения к общей инфраструктуре:

| Слой        | Ответственность                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| `app/`      | Bootstrap, providers, router, глобальные стили, app shell                     |
| `pages/`    | Композиции уровня маршрута: `/login`, `/notebooks`, `/notebooks/:notebookId`  |
| `features/` | Пользовательские сценарии: auth, список notebook, editor, execution, sync, AI |
| `entities/` | Доменные примитивы: notebook, block, output, execution session, user          |
| `shared/`   | Сквозная инфраструктура: API client, persistence, UI kit, config, lib         |

**Направление импортов (обязательно):**

```text
app → pages → features → entities → shared
```

- Слой может импортировать только из того же слоя (через public API) или из слоёв ниже.
- Импорты «вверх» запрещены (`shared` не импортирует из `features`, `entities` не импортирует из `pages` и т.д.).
- Прямые импорты между соседними слайсами одного слоя запрещены, если ниже не указано иное.

### 4.2 Структура каталогов

Каноническая раскладка `src/`:

```text
src/
  app/
    providers/
    router/
    styles/
    index.tsx
  pages/
    login/
    notebooks-list/
    notebook-editor/
  features/
    auth/
    notebooks/
    editor/
    execution/
    sync/
    ai/
  entities/
    notebook/
    block/
    output/
    session/
    user/
  shared/
    api/
    config/
    lib/
    persistence/
    ui/
    types/
```

### 4.3 Внутренние сегменты слайса

Каждый слайс в `features/`, `entities/` или `shared/` при необходимости использует стандартные сегменты FSD:

| Сегмент    | Типичное содержимое                                              |
| ---------- | ---------------------------------------------------------------- |
| `ui/`      | Компоненты и presentational views                                |
| `model/`   | Сегменты Zustand, селекторы, actions, локальная логика состояния |
| `api/`     | Адаптеры запросов и DTO-mappers для слайса                       |
| `lib/`     | Чистые хелперы, используемые только внутри слайса                |
| `index.ts` | **Public API** слайса                                            |

Слайсы `pages/` содержат только композицию маршрута (для большинства стран достаточно `ui/` + `index.ts`).

`app/` не экспортирует product-слайсы через public `index.ts`; это корень композиции.

### 4.4 Ответственность слоёв

#### `app/`

- композиция providers (`RouterProvider`, опционально `QueryClientProvider`, error boundary)
- таблица маршрутов и guards
- глобальный layout shell и точки входа стилей
- опциональная сборка корневого Zustand store из сегментов `model/` features/entities на этапе миграции

#### `pages/`

- одна папка на маршрут
- композиция entry points из features и entities
- без прямого доступа к IndexedDB, без сырого `fetch`, без глубоких доменных правил

#### `features/`

- auth flow (email OTP, вход через Google, UI осведомлённости о сессии)
- взаимодействия со списком notebook (создание, открытие)
- editor (CRUD блоков, reorder, toolbar)
- execution controls (run block / all / from here, stop)
- sync (явная синхронизация, entry points UX конфликта)
- AI (block-scoped prompt и apply flow)

#### `entities/`

- формы notebook, block, output, session, user
- Zod-схемы, типы, mappers
- небольшие переиспользуемые UI вокруг сущности (например `BlockCard`, `OutputView`) без оркестрации feature

#### `shared/`

- `api/httpClient` и transport helpers
- адаптеры `persistence/` (IndexedDB/Dexie)
- design tokens и низкоуровневые UI primitives
- конфигурация окружения и общие утилиты

### 4.5 Правила Public API

Каждый слайс экспортирует **public API** через `index.ts` в корне слайса.

**Разрешённые импорты извне слайса:**

```ts
import { LoginForm } from "@/features/auth";
import { NotebookBlock } from "@/entities/block";
import { httpClient } from "@/shared/api";
```

**Запрещённые импорты извне слайса:**

```ts
import { LoginForm } from "@/features/auth/ui/LoginForm";
import { mapNotebookDto } from "@/entities/notebook/lib/mapNotebookDto";
```

Правила:

1. Внешний код импортирует только из public API слайса (`features/auth`, `entities/notebook`, `shared/api` и т.д.).
2. Deep-import в `ui/`, `model/`, `api/` или `lib/` из другого слайса или из `pages/` запрещён.
3. Внутри слайса между сегментами используются относительные импорты.
4. `pages/` импортируют features и entities только через их public API.
5. `app/` импортирует `pages/` через public API страниц и подключает инфраструктуру из `shared/`.
6. В `index.ts` реэкспортируются только символы, которые ожидаются у родительских слоёв; внутренности не экспортируются.

**Что входит в public API:**

| Слой         | Экспорт через `index.ts`                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| `features/*` | Компоненты секций экрана, хуки и actions/coordinators для `pages/`                   |
| `entities/*` | Типы, схемы, mappers и переиспользуемые entity UI building blocks                    |
| `shared/*`   | Стабильные фасады инфраструктуры (`httpClient`, persistence adapters, UI primitives) |
| `pages/*`    | Компонент страницы по умолчанию для маршрута                                         |

**Что не экспортируется:**

- внутренние хелперы слайса, если они не нужны другому слою (лучше опустить в `entities/` или `shared/lib/`)
- детали реализации store, если контрактом является selector hook
- утилиты только для тестов

### 4.6 Допустимые зависимости между слайсами

По умолчанию: **нет** прямых импортов между соседними слайсами `features/*`.

Если нужна координация:

- общие типы или чистую логику поднять в `entities/` или `shared/lib/`
- собрать оба feature на уровне `pages/`
- передать callbacks/данные со страницы вместо импорта внутренностей другого feature

`entities/` зависит только от `shared/`. `features/` — от `entities/` и `shared/`.

### 4.7 Владение состоянием в FSD

Сегменты Zustand выровнены по границам продукта:

| Сегмент store                         | Основной владелец                                 |
| ------------------------------------- | ------------------------------------------------- |
| `authStore`                           | `features/auth/model/`                            |
| `notebookListStore`                   | `features/notebooks/model/`                       |
| `activeNotebookStore`, `blockUiStore` | `features/editor/model/`                          |
| `executionStore`                      | `features/execution/model/`                       |
| `syncStore`                           | `features/sync/model/`                            |
| `appUiStore`                          | `app/` или `shared/` (только transient global UI) |

На этапе поэтапной миграции приложение может собирать слайсы в `app/model/` (единый `useAppStore` с slices), но логика и селекторы каждого сегмента остаются у соответствующего feature и при необходимости реэкспортируются через public API feature для `pages/`.

Ни один сегмент store не должен владеть одновременно durable notebook content и execution output artifacts.

### 4.8 Соответствие маршрутов и слайсов

| Маршрут                  | Page slice               | Основные feature slices                                                 |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| `/login`                 | `pages/login/`           | `features/auth`                                                         |
| `/notebooks`             | `pages/notebooks-list/`  | `features/notebooks`, `features/auth`                                   |
| `/notebooks/:notebookId` | `pages/notebook-editor/` | `features/editor`, `features/execution`, `features/sync`, `features/ai` |

## 5. Routing Model

Frontend routing model:

### 5.1 `/login`

Назначение:

- ввод email пользователя
- ввод OTP
- запуск входа через Google
- переход пользователя в аутентифицированное состояние

### 5.2 `/notebooks`

Назначение:

- показать список notebook пользователя
- создать notebook
- открыть notebook

### 5.3 `/notebooks/:notebookId`

Назначение:

- открыть notebook editor
- загрузить активную рабочую копию notebook
- редактировать блоки
- запускать notebook-код
- выполнять sync
- использовать AI для block-level code updates

## 6. Структура экранов

### 6.1 Login Screen

Login screen содержит:

- input email
- submit action для запроса OTP
- input OTP
- submit action для проверки OTP
- action входа через Google
- request status feedback
- authentication error feedback

### 6.2 Notebook List Screen

Notebook list screen содержит:

- page header
- action создания notebook
- список notebook
- item actions там, где нужно
- loading state
- empty state
- error state

### 6.3 Notebook Editor Screen

Notebook editor screen содержит:

- верхнюю панель notebook actions
- центральный вертикальный список blocks
- block-level action cluster рядом с каждым блоком
- block content area
- block output area для исполняемых блоков
- индикатор sync-state

Notebook editor screen не содержит глобального AI workspace в Version 1.

## 7. Layout редактора notebook

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

## 8. Block model в UI

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

## 9. Block Action Cluster

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

## 10. Редактирование text block

Text blocks редактируются как `Markdown`.

Text editing в Version 1 использует Markdown-oriented editing surface.

UI text block поддерживает:

- ввод обычного текста
- ввод Markdown syntax
- обычные операции редактирования текстового блока

Version 1 не включает rich text editor.

## 11. Редактирование code block

Code blocks редактируются через `CodeMirror`.

UI code block поддерживает:

- редактирование исполняемого `JavaScript`
- сохранение code content как части notebook-блока
- block-level execution actions
- AI-assisted replacement или refinement кода

Code editor является частью блока, а не отдельным IDE workspace.

## 12. Рендеринг output

Output рендерится в контексте code block, который этот output породил.

Поддерживаемые output types в Version 1:

- `text`
- `object`
- `table`
- `chart`
- `error`

Output показывается непосредственно под или рядом с content area соответствующего code block внутри его контекста.

Output не моделируется как отдельный notebook block type.

## 13. AI User Flow

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

## 14. Execution User Flow

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

## 15. Локальная персистентность и Sync UX

Frontend интегрирует локальную персистентность и явную синхронизацию.

UI отвечает за:

- хранение активной рабочей копии notebook локально
- маркировку notebook при наличии unsynced changes
- явную пользовательскую action синхронизации
- отображение sync-state
- отображение sync conflict state, если его возвращает backend

Version 1 не скрывает синхронизацию за silent always-on merge model.

## 16. Архитектура frontend-state

Frontend application state управляется через `Zustand`.

Frontend-state разделен на следующие логические области:

### 16.1 Auth State

Содержит:

- authentication status
- осведомленность о текущей user session
- login flow state
- OTP flow UI state
- Google sign-in flow state

### 16.2 Notebook List State

Содержит:

- notebook list data
- notebook list loading state
- notebook list error state

### 16.3 Active Notebook State

Содержит:

- identity активного notebook
- notebook metadata
- ordered blocks
- local working copy state
- dirty или unsynced markers

### 16.4 Block UI State

Содержит:

- selected block
- focused block
- видимость block toolbar
- block-local editing UI state
- видимость AI prompt для блока

### 16.5 Execution State

Содержит:

- current execution status
- current execution target
- running block markers
- execution error state
- block output bindings

### 16.6 Sync State

Содержит:

- markers последнего синхронизированного состояния
- sync in-progress state
- sync success state
- sync conflict state
- sync error state

### 16.7 App UI State

Содержит:

- global loading indicators там, где они нужны
- transient notifications
- page-level UI state

## 17. Границы потоков данных

Frontend взаимодействует со следующими частями системы:

### 17.1 Backend API

Используется для:

- аутентификации
- загрузки списка notebook
- получения notebook
- синхронизации notebook
- AI-запросов

### 17.2 Local Storage

Используется для:

- персистентности локальной рабочей копии notebook
- восстановления после reload
- локальных sync-метаданных

### 17.3 Execution Orchestrator

Используется для:

- run block
- run from block
- run all
- stop execution

### 17.4 Execution Runtime

Используется косвенно через execution orchestrator для:

- изолированного выполнения `JavaScript`
- формирования output
- хранения execution session state

## 18. Error и Empty States

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

## 19. UI-функции вне Version 1

Следующие UI-функции не входят в Version 1:

- rich text editor
- image block type
- рендеринг изображений внутри blocks
- global AI workspace
- real-time collaborative editing UI
- inline review comment system
- multi-pane IDE-like workspace

## 20. Связанные документы

- [ui_architecture.md](./ui_architecture.md) — каноническая английская версия
- [system_architectureRU.md](../../docs/system_architectureRU.md)
- [tech_stackRU.md](../../docs/tech_stackRU.md)
- [projectRU.md](../../docs/projectRU.md)
