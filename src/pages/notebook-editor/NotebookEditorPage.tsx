import { useState } from "react";
import {
  createCodeBlock,
  createOutputPlaceholder,
  createTextBlock,
  deleteBlock,
  getOutputForBlock,
  insertBlockAfter,
  moveBlock,
  notebookContentBlockIds,
  outputBlockIds,
  updateCodeBlockSource,
  updateTextBlockMarkdown
} from "../../entities/notebook/notebookModel";
import {
  sampleNotebook,
  sampleOutputPlaceholders
} from "../../entities/notebook/sampleNotebook";
import type { CodeBlock, Notebook, NotebookBlock, TextBlock } from "../../entities/notebook/types";
import type { OutputPlaceholder } from "../../entities/output/types";
import "./NotebookEditorPage.css";

type BlockActions = {
  addBlockAfter: (blockId: string, type: NotebookBlock["type"]) => void;
  deleteBlockById: (blockId: string) => void;
  moveBlockById: (blockId: string, direction: "up" | "down") => void;
  runBlock: (blockId: string) => void;
  updateText: (blockId: string, markdown: string) => void;
  updateCode: (blockId: string, source: string) => void;
};

function BlockActionCluster({
  block,
  isFirst,
  isLast,
  actions
}: {
  block: NotebookBlock;
  isFirst: boolean;
  isLast: boolean;
  actions: BlockActions;
}) {
  return (
    <div className="block-actions" aria-label={`Actions for ${block.id}`}>
      <div className="add-actions" aria-label={`Add block after ${block.id}`}>
        <button
          type="button"
          className="editor-button editor-button-secondary"
          aria-label={`Add text block after ${block.id}`}
          onClick={() => actions.addBlockAfter(block.id, "text")}
        >
          + Text
        </button>
        <button
          type="button"
          className="editor-button editor-button-secondary"
          aria-label={`Add code block after ${block.id}`}
          onClick={() => actions.addBlockAfter(block.id, "code")}
        >
          + Code
        </button>
      </div>
      <button
        type="button"
        className="editor-button editor-button-secondary"
        aria-label={`Move ${block.id} up`}
        disabled={isFirst}
        onClick={() => actions.moveBlockById(block.id, "up")}
      >
        Up
      </button>
      <button
        type="button"
        className="editor-button editor-button-secondary"
        aria-label={`Move ${block.id} down`}
        disabled={isLast}
        onClick={() => actions.moveBlockById(block.id, "down")}
      >
        Down
      </button>
      <button
        type="button"
        className="editor-button editor-button-secondary"
        aria-label={`Delete ${block.id}`}
        onClick={() => actions.deleteBlockById(block.id)}
      >
        Delete
      </button>
      {block.type === "code" ? (
        <button
          type="button"
          className="editor-button run-action"
          aria-label={`Run ${block.id}`}
          onClick={() => actions.runBlock(block.id)}
        >
          Run
        </button>
      ) : null}
    </div>
  );
}

function MarkdownTextBlock({
  block,
  updateText
}: {
  block: TextBlock;
  updateText: BlockActions["updateText"];
}) {
  return (
    <div className="block-body text-block" aria-label="Markdown text block">
      <label className="block-kicker" htmlFor={`${block.id}-markdown`}>
        Markdown
      </label>
      <textarea
        id={`${block.id}-markdown`}
        aria-label={`Markdown source for ${block.id}`}
        value={block.content.markdown}
        onChange={(event) => updateText(block.id, event.target.value)}
      />
    </div>
  );
}

function CodeBlockView({
  block,
  output,
  runBlock,
  updateCode
}: {
  block: CodeBlock;
  output?: OutputPlaceholder;
  runBlock: BlockActions["runBlock"];
  updateCode: BlockActions["updateCode"];
}) {
  return (
    <div className="block-body code-block" aria-label="JavaScript code block">
      <div className="code-header">
        <label className="block-kicker" htmlFor={`${block.id}-source`}>
          JavaScript
        </label>
        <button
          type="button"
          className="editor-button run-inline"
          aria-label={`Run block ${block.id}`}
          onClick={() => runBlock(block.id)}
        >
          Run block
        </button>
      </div>
      <textarea
        id={`${block.id}-source`}
        className="code-source"
        aria-label={`JavaScript source for ${block.id}`}
        value={block.content.source}
        spellCheck={false}
        onChange={(event) => updateCode(block.id, event.target.value)}
      />
      <section className="output-placeholder" aria-label={`Output area for ${block.id}`}>
        <span>Output</span>
        <p>{output?.label ?? "Output placeholder is intentionally empty."}</p>
      </section>
    </div>
  );
}

function NotebookBlockView({
  block,
  index,
  blockCount,
  output,
  actions
}: {
  block: NotebookBlock;
  index: number;
  blockCount: number;
  output?: OutputPlaceholder;
  actions: BlockActions;
}) {
  return (
    <article className={`notebook-block notebook-block-${block.type}`}>
      <BlockActionCluster
        block={block}
        isFirst={index === 0}
        isLast={index === blockCount - 1}
        actions={actions}
      />
      {block.type === "text" ? (
        <MarkdownTextBlock block={block} updateText={actions.updateText} />
      ) : (
        <CodeBlockView
          block={block}
          output={output}
          runBlock={actions.runBlock}
          updateCode={actions.updateCode}
        />
      )}
    </article>
  );
}

export function NotebookEditorPage() {
  const [notebook, setNotebook] = useState<Notebook>(sampleNotebook);
  const [outputs, setOutputs] = useState<OutputPlaceholder[]>(
    sampleOutputPlaceholders
  );
  const [nextBlockNumber, setNextBlockNumber] = useState(1);

  const createBlockId = (type: NotebookBlock["type"]) => {
    const blockId = `blk_new_${type}_${nextBlockNumber}`;
    setNextBlockNumber((current) => current + 1);
    return blockId;
  };

  const actions: BlockActions = {
    addBlockAfter: (blockId, type) => {
      const newBlockId = createBlockId(type);
      const newBlock =
        type === "text" ? createTextBlock(newBlockId) : createCodeBlock(newBlockId);

      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: insertBlockAfter(currentNotebook.blocks, blockId, newBlock)
      }));

      if (newBlock.type === "code") {
        setOutputs((currentOutputs) => [
          ...currentOutputs,
          createOutputPlaceholder(newBlock.id)
        ]);
      }
    },
    deleteBlockById: (blockId) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: deleteBlock(currentNotebook.blocks, blockId)
      }));
      setOutputs((currentOutputs) =>
        currentOutputs.filter((output) => output.blockId !== blockId)
      );
    },
    moveBlockById: (blockId, direction) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: moveBlock(currentNotebook.blocks, blockId, direction)
      }));
    },
    runBlock: (blockId) => {
      setOutputs((currentOutputs) =>
        currentOutputs.map((output) =>
          output.blockId === blockId
            ? {
                ...output,
                label:
                  "Run requested. Execution is intentionally out of scope for this task."
              }
            : output
        )
      );
    },
    updateText: (blockId, markdown) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateTextBlockMarkdown(currentNotebook.blocks, blockId, markdown)
      }));
    },
    updateCode: (blockId, source) => {
      setNotebook((currentNotebook) => ({
        ...currentNotebook,
        blocks: updateCodeBlockSource(currentNotebook.blocks, blockId, source)
      }));
    }
  };

  const contentBlockIds = notebookContentBlockIds(notebook);
  const boundOutputIds = outputBlockIds(outputs);
  const lastBlockId = contentBlockIds[contentBlockIds.length - 1] ?? "";

  return (
    <div className="notebook-editor">
      <header className="editor-topbar">
        <div>
          <a href="/notebooks" aria-label="Back to notebooks">
            Notebooks
          </a>
          <span className="topbar-separator" aria-hidden="true">
            /
          </span>
          <span className="topbar-title">{notebook.title}</span>
        </div>
        <div className="topbar-actions" aria-label="Notebook actions">
          <button
            type="button"
            className="editor-button editor-button-secondary"
            onClick={() => actions.addBlockAfter(lastBlockId, "text")}
          >
            Add text block
          </button>
          <button
            type="button"
            className="editor-button editor-button-secondary"
            onClick={() => actions.addBlockAfter(lastBlockId, "code")}
          >
            Add code block
          </button>
          <button
            type="button"
            className="editor-button editor-button-secondary"
            disabled
          >
            Sync placeholder
          </button>
          <button
            type="button"
            className="editor-button editor-button-secondary"
            disabled
          >
            Run all placeholder
          </button>
          <button
            type="button"
            className="editor-button editor-button-secondary"
            disabled
          >
            Export placeholder
          </button>
        </div>
      </header>

      <section className="notebook-meta" aria-labelledby="notebook-title">
        <p className="eyebrow">Notebook editor template</p>
        <h1 id="notebook-title">{notebook.title}</h1>
        <p>
          Ordered blocks: {contentBlockIds.length}. Output bindings:{" "}
          {boundOutputIds.length}. Revision {notebook.revision}.
        </p>
      </section>

      <section className="block-list" aria-label="Notebook blocks">
        {notebook.blocks.map((block, index) => (
          <NotebookBlockView
            key={block.id}
            block={block}
            index={index}
            blockCount={notebook.blocks.length}
            output={getOutputForBlock(outputs, block.id)}
            actions={actions}
          />
        ))}
      </section>
    </div>
  );
}
