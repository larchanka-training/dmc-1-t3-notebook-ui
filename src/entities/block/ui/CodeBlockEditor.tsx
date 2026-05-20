import type { CodeBlock } from "../model/types";
import { Button } from "@/shared/ui";

type CodeBlockEditorProps = {
  block: CodeBlock;
  runButtonClassName: string;
  onRun: () => void;
  onChange: (source: string) => void;
};

export function CodeBlockEditor({
  block,
  runButtonClassName,
  onRun,
  onChange,
}: CodeBlockEditorProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border-token px-token-16 py-token-12">
        <label
          className="inline-flex text-xs font-semibold text-ink-muted"
          htmlFor={`${block.id}-source`}
        >
          JavaScript
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={runButtonClassName}
          aria-label={`Run block ${block.id}`}
          onClick={onRun}
        >
          Run block
        </Button>
      </div>
      <textarea
        id={`${block.id}-source`}
        aria-label={`JavaScript source for ${block.id}`}
        value={block.content.source}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-48 w-full resize-y overflow-x-auto border-0 bg-gray-900 p-4 font-mono text-sm leading-relaxed text-gray-200 outline-none"
      />
    </>
  );
}
