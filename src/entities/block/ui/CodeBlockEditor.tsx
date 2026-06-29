import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import type { CodeBlock } from "../model/types";
import {
  getCodeBlockHeight,
  getCodeBlockMaxHeight,
  getCodeBlockMinHeight,
} from "../lib/editorSizing";

type CodeBlockEditorProps = {
  block: CodeBlock;
  onChange: (source: string) => void;
};

export function CodeBlockEditor({ block, onChange }: CodeBlockEditorProps) {
  const editorHeight = getCodeBlockHeight(block.content.source);

  return (
    <>
      <CodeMirror
        id={`${block.id}-source`}
        value={block.content.source}
        height={editorHeight}
        minHeight={getCodeBlockMinHeight()}
        maxHeight={getCodeBlockMaxHeight()}
        extensions={[javascript()]}
        aria-label={`JavaScript source for ${block.id}`}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
        }}
        onChange={(value) => onChange(value)}
        className="overflow-x-auto [&_.cm-editor]:bg-[#f7f7f5] [&_.cm-gutters]:bg-[#f7f7f5] [&_.cm-editor]:text-sm [&_.cm-scroller]:font-mono [&_.cm-content]:py-2.5 [&_.cm-scroller]:overflow-auto"
      />
    </>
  );
}
