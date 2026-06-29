# Левый Sidebar Notebook Editor

> Неканонический русскоязычный companion. Каноническая версия: [notebook_editor_sidebar.md](./notebook_editor_sidebar.md).

## Назначение

Этот документ описывает текущий артефакт левого sidebar для маршрута notebook editor (`/notebooks/:notebookId`).

Он фиксирует:

- роль sidebar в shell notebook editor
- ожидаемые layout и scroll behavior
- expanded и collapsed состояния
- поведение списка notebook
- поведение нижней utility area
- accessibility и interaction requirements

Это UI artifact и layout contract. Он дополняет `screen_specs.md`, `page_design_scheme.md` и `ui_architecture.md`.

## Scope

В scope:

- левый sidebar внутри маршрута notebook editor
- notebook navigation в editor context
- collapse и expand behavior
- поведение icon rail
- видимость нижней utility section
- распределение scroll ownership между sidebar и editor content area

Вне scope:

- верхний глобальный app header
- chrome notebook blocks и block-local controls
- дизайн notebook list page вне editor route
- drag and drop, search, pinning, favorites и tags

## Product Intent

Sidebar должен делать notebook editor ближе по ощущению к notebook tool вроде Colab:

- navigation остается доступной во время редактирования
- текущий список notebook остается видимым, но не конкурирует с документом
- нижняя utility area остается достижимой без page scrolling
- основной документ сохраняет визуальный приоритет

Sidebar не должен превращаться в branded hero panel или второе рабочее пространство.

## Layout Structure

Shell notebook editor делится на две области:

1. левый notebook sidebar
2. правая editor scroll area

Sidebar является областью фиксированной высоты внутри route container editor. Он должен использовать доступную высоту ниже глобального app header, а не всю высоту browser viewport.

Sidebar по вертикали делится на:

1. верхнюю utility row с control для collapse/expand
2. action создания notebook
3. scrollable area списка notebook
4. нижнюю utility area

## Scroll Model

Sidebar должен оставаться визуально фиксированным, пока пользователь скроллит notebook content.

Требуемое поведение:

- shell editor page использует высоту route container
- правая editor region владеет основным вертикальным scroll для notebook content
- sidebar не двигается вместе с block content
- footer sidebar остается видимым у нижней границы sidebar
- только секция notebook list внутри sidebar может скроллиться, когда список выше доступной высоты

Это означает такую модель route layout:

- shell: fixed внутри route container
- sidebar: fixed внутри shell
- notebook list: internal scroll region
- editor content: independent scroll region

## Expanded State

В expanded state sidebar показывает:

- кнопку collapse, выровненную по правому верхнему краю
- action row `New notebook`
- section label вроде `Your notebooks`
- notebook items с title и origin metadata
- нижнюю utility area с `All notebooks`
- compact user summary card, если есть authenticated user

Visual rules:

- neutral background
- subtle border по правому краю
- low-contrast separators между row
- compact spacing
- без decorative brand block наверху

## Collapsed State

В collapsed state sidebar превращается в icon rail.

Требуемое поведение:

- ширина уменьшается до icon-first rail
- верхний control переключается в expand affordance
- create notebook остается доступным как icon-only action
- notebook items остаются кликабельными как icon-only rows
- нижняя utility area остается видимой
- item labels не рендерятся inline

Collapsed state должен оставаться распознаваемым за счет:

- стабильных позиций row
- консистентных icon
- hover tooltip text
- `aria-label` на icon-only controls

## Поведение Notebook Item

Каждый notebook item в sidebar должен:

- открывать выбранный notebook
- визуально показывать active notebook
- показывать notebook title
- показывать concise origin metadata в expanded state
- раскрывать notebook title через hover tooltip

Row active notebook должен быть явно различимым, но оставаться low-noise.

Рекомендуемое active state:

- subtle surface tint
- faint ring или border emphasis
- более сильный text contrast, чем у inactive row

## Нижняя Utility Area

Нижняя utility area закреплена у нижней границы sidebar.

Сейчас она содержит:

- navigation link `All notebooks`
- authenticated user summary card, если доступен

Требования:

- footer должен оставаться видимым без прокрутки main page
- footer не должен уходить ниже fold из-за scrolling notebook content
- footer должен оставаться compact и operational

## Hover и Tooltip Behavior

Sidebar использует легкие hover hints вместо постоянных поясняющих label в icon-only состояниях.

Требуемое поведение:

- icon-only actions показывают tooltip или эквивалентный hover hint
- notebook rows показывают notebook title on hover
- create notebook action показывает hint вроде `Add notebook`
- hover hints не должны быть единственным accessible name

`title` attributes допустимы как минимальная artifact-level implementation. Позже их можно заменить richer tooltip primitives, если semantics сохраняются.

## Требования Доступности

Sidebar должен оставаться полностью достижимым с клавиатуры.

Требуемое поведение:

- control collapse/expand управляется с клавиатуры
- create notebook action управляется с клавиатуры
- кнопки notebook item управляются с клавиатуры
- icon-only controls имеют accessible names
- row active notebook отдает `aria-current="page"` или эквивалентную route-active semantics
- focus-visible states остаются заметными на всех interactive rows

## Acceptance Criteria

- маршрут notebook editor содержит левый sidebar и правую editor region
- sidebar остается фиксированным, пока editor content скроллится
- нижняя utility area остается видимой у нижней границы sidebar
- notebook list area скроллится независимо при необходимости
- sidebar поддерживает expanded и collapsed состояния
- collapsed state остается usable через icons, focus states и tooltips
- notebook items показывают notebook names on hover
- control создания notebook показывает hover hint `Add notebook`
- высота editor shell учитывает глобальный app header и не использует raw viewport height внутри nested route
