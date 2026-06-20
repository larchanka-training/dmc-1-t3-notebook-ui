import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
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
      <CodeMirror
        id={`${block.id}-source`}
        value={block.content.source}
        height="12rem"
        extensions={[javascript()]}
        aria-label={`JavaScript source for ${block.id}`}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
        }}
        onChange={(value) => onChange(value)}
        className="overflow-x-auto [&_.cm-editor]:bg-gray-100 [&_.cm-gutters]:bg-gray-100 [&_.cm-editor]:text-sm [&_.cm-scroller]:font-mono [&_.cm-content]:py-4"
      />
    </>
  );
}
