import type { TextBlock } from "../model/types";
import { useTextBlockEditor } from "../model/useTextBlockEditor";

type TextBlockEditorProps = {
  block: TextBlock;
  onChange: (markdown: string) => void;
};

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  const { textareaRef, handleChange } = useTextBlockEditor(block, onChange);

  return (
    <div className="px-4 py-3" aria-label="Markdown text block">
      <textarea
        ref={textareaRef}
        id={`${block.id}-markdown`}
        aria-label={`Markdown source for ${block.id}`}
        value={block.content.markdown}
        onChange={handleChange}
        rows={1}
        className="w-full resize-none border-0 bg-transparent text-[0.9375rem] leading-6 text-ink outline-none"
      />
    </div>
  );
}
