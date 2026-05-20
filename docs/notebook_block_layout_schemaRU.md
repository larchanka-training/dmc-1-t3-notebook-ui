# Схема layout блоков notebook

> Неканонический русскоязычный companion. Каноническая версия: [notebook_block_layout_schema.md](./notebook_block_layout_schema.md).

## Назначение

Как blocks определяются, упорядочиваются, размещаются на странице editor и структурируются в UI.

## Block types (V1)

| Type   | Purpose               | Editable content   |
| ------ | --------------------- | ------------------ |
| `text` | Markdown notes        | `content.markdown` |
| `code` | Executable JavaScript | `content.source`   |

Outputs — не blocks; artifacts по `blockId`.

## Data shape

```ts
type NotebookBlock =
  | { id: string; type: "text"; content: { markdown: string } }
  | {
      id: string;
      type: "code";
      content: { source: string; language: "javascript" };
    };

type Notebook = {
  id: string;
  title: string;
  revision: number;
  blocks: NotebookBlock[];
};
```

Порядок `notebook.blocks` = визуальный порядок в editor.

```txt
Notebook
  ├─ Text block
  ├─ Code block
  │   └─ Output area
  ├─ Text block
  └─ Code block
      └─ Output area
```

## Page placement

```txt
Editor page
  ├─ Top action bar
  ├─ Notebook metadata
  └─ Ordered block list
```

Без permanent split view / global side panel в V1.

## Block placement

```txt
Block row
  ├─ Block action cluster
  └─ Block content area
```

Wide: cluster сбоку; narrow: в том же vertical flow, локально блоку.

## Block action cluster

| Action         | Applies to |
| -------------- | ---------- |
| Add text after | text, code |
| Add code after | text, code |
| Move up/down   | text, code |
| Delete         | text, code |
| Run block      | code only  |

Все actions — keyboard reachable.

## Text block layout

Label Markdown + textarea; значение `block.content.markdown`; без output area.

## Code block layout

Header (JavaScript + run), source editor, attached output area; значение `block.content.source`.

## Output binding

Outputs отдельно от content blocks; связь `output.blockId` === `block.id`.

## Required UI rules

- vertical notebook flow
- local block actions
- Markdown / JavaScript surfaces
- output у code block, не отдельный block type
- keyboard access
- explicit empty/disabled/running/success/error states по мере реализации
