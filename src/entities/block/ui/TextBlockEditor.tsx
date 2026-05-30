import type { TextBlock } from "../model/types";

type TextBlockEditorProps = {
  block: TextBlock;
  onChange: (markdown: string) => void;
};

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  return (
    <div className="p-4" aria-label="Markdown text block">
      <label
        className="mb-2 inline-flex text-xs font-semibold text-ink-muted"
        htmlFor={`${block.id}-markdown`}
      >
        Markdown
      </label>
      <textarea
        id={`${block.id}-markdown`}
        aria-label={`Markdown source for ${block.id}`}
        value={block.content.markdown}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-y border-0 bg-transparent text-[0.9375rem] leading-relaxed text-ink outline-none"
      />
    </div>
  );
}
