import {
  getOutputForBlock,
  notebookContentBlockIds,
  outputBlockIds
} from "../../entities/notebook/notebookModel";
import {
  sampleNotebook,
  sampleOutputPlaceholders
} from "../../entities/notebook/sampleNotebook";
import type { CodeBlock, NotebookBlock, TextBlock } from "../../entities/notebook/types";
import type { OutputPlaceholder } from "../../entities/output/types";
import "./NotebookEditorPage.css";

function BlockActionCluster({ block }: { block: NotebookBlock }) {
  return (
    <div className="block-actions" aria-label={`Actions for ${block.type} block`}>
      <button type="button" aria-label={`Add block near ${block.id}`}>
        +
      </button>
      <button type="button" aria-label={`Move ${block.id} up`}>
        Up
      </button>
      <button type="button" aria-label={`Move ${block.id} down`}>
        Down
      </button>
      <button type="button" aria-label={`Delete ${block.id}`}>
        Delete
      </button>
      {block.type === "code" ? (
        <button type="button" className="run-action" aria-label={`Run ${block.id}`}>
          Run
        </button>
      ) : null}
    </div>
  );
}

function MarkdownTextBlock({ block }: { block: TextBlock }) {
  return (
    <div className="block-body text-block" aria-label="Markdown text block">
      <span className="block-kicker">Markdown</span>
      <pre>{block.content.markdown}</pre>
    </div>
  );
}

function CodeBlockView({
  block,
  output
}: {
  block: CodeBlock;
  output?: OutputPlaceholder;
}) {
  return (
    <div className="block-body code-block" aria-label="JavaScript code block">
      <div className="code-header">
        <span className="block-kicker">JavaScript</span>
        <button
          type="button"
          className="run-inline"
          aria-label={`Run block ${block.id}`}
        >
          Run block
        </button>
      </div>
      <pre className="code-source">
        <code>{block.content.source}</code>
      </pre>
      <section className="output-placeholder" aria-label={`Output area for ${block.id}`}>
        <span>Output</span>
        <p>{output?.label ?? "Output placeholder is intentionally empty."}</p>
      </section>
    </div>
  );
}

function NotebookBlockView({ block }: { block: NotebookBlock }) {
  const output = getOutputForBlock(sampleOutputPlaceholders, block.id);

  return (
    <article className={`notebook-block notebook-block-${block.type}`}>
      <BlockActionCluster block={block} />
      {block.type === "text" ? (
        <MarkdownTextBlock block={block} />
      ) : (
        <CodeBlockView block={block} output={output} />
      )}
    </article>
  );
}

export function NotebookEditorPage() {
  const contentBlockIds = notebookContentBlockIds(sampleNotebook);
  const boundOutputIds = outputBlockIds(sampleOutputPlaceholders);

  return (
    <main className="notebook-editor">
      <header className="editor-topbar">
        <a href="/notebooks" aria-label="Back to notebooks">
          Notebooks
        </a>
        <div className="topbar-actions" aria-label="Notebook actions">
          <button type="button" disabled>
            Sync placeholder
          </button>
          <button type="button" disabled>
            Run all placeholder
          </button>
          <button type="button" disabled>
            Export placeholder
          </button>
        </div>
      </header>

      <section className="notebook-meta" aria-labelledby="notebook-title">
        <p className="eyebrow">Notebook editor template</p>
        <h1 id="notebook-title">{sampleNotebook.title}</h1>
        <p>
          Ordered blocks: {contentBlockIds.length}. Output bindings:{" "}
          {boundOutputIds.length}. Revision {sampleNotebook.revision}.
        </p>
      </section>

      <section className="block-list" aria-label="Notebook blocks">
        {sampleNotebook.blocks.map((block) => (
          <NotebookBlockView key={block.id} block={block} />
        ))}
      </section>
    </main>
  );
}
