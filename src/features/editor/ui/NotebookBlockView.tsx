import type { NotebookBlock } from "@/entities/notebook";
import { CodeBlockEditor, TextBlockEditor } from "@/entities/block";
import { OutputView } from "@/entities/output";
import type { OutputItem } from "@/entities/output";
import { cn } from "@/shared/lib";
import { editorRunButtonClass } from "../lib/editorStyles";
import type { BlockActions } from "../model/types";
import { BlockActionCluster } from "./BlockActionCluster";

type NotebookBlockViewProps = {
  block: NotebookBlock;
  index: number;
  blockCount: number;
  outputs?: OutputItem[];
  actions: BlockActions;
  executionState: {
    isRunning: boolean;
    isTarget: boolean;
    canRun: boolean;
    canRunFromHere: boolean;
    canStop: boolean;
  };
};

export function NotebookBlockView({
  block,
  index,
  blockCount,
  outputs,
  actions,
  executionState,
}: NotebookBlockViewProps) {
  return (
    <article
      className={cn(
        "group grid grid-cols-[8.75rem_minmax(0,1fr)] items-start gap-3",
        "max-md:flex max-md:flex-col",
      )}
    >
      <BlockActionCluster
        block={block}
        isFirst={index === 0}
        isLast={index === blockCount - 1}
        actions={actions}
        executionState={executionState}
      />
      <div
        className={cn(
          "overflow-hidden rounded-[var(--block-radius)] border border-border-token bg-surface",
          "focus-within:border-[var(--color-accent-primary)]/55",
          "focus-within:shadow-[0_0_0_3px_rgba(157,107,43,0.12)]",
          "max-md:order-1 max-md:w-full",
        )}
      >
        {block.type === "text" ? (
          <TextBlockEditor
            block={block}
            onChange={(markdown) => actions.updateText(block.id, markdown)}
          />
        ) : (
          <div aria-label="JavaScript code block">
            <CodeBlockEditor
              block={block}
              runButtonClassName={editorRunButtonClass}
              onRun={() => actions.runBlock(block.id)}
              onChange={(source) => actions.updateCode(block.id, source)}
            />
            <OutputView blockId={block.id} outputs={outputs} />
          </div>
        )}
      </div>
    </article>
  );
}
