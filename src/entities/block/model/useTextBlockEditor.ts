import { useLayoutEffect, useRef, type ChangeEvent, type RefObject } from "react";
import type { TextBlock } from "./types";
import { getTextBlockHeight, isTextBlockScrollable } from "../lib/editorSizing";

type EditorTextarea = globalThis.HTMLTextAreaElement;

type UseTextBlockEditorResult = {
  textareaRef: RefObject<EditorTextarea>;
  handleChange: (event: ChangeEvent<EditorTextarea>) => void;
};

function resizeTextarea(element: EditorTextarea) {
  element.style.height = "0px";
  const nextHeight = getTextBlockHeight(element.scrollHeight);
  element.style.height = `${nextHeight}px`;
  element.style.overflowY = isTextBlockScrollable(element.scrollHeight)
    ? "auto"
    : "hidden";
}

export function useTextBlockEditor(
  block: TextBlock,
  onChange: (markdown: string) => void,
): UseTextBlockEditorResult {
  const textareaRef = useRef<EditorTextarea>(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [block.content.markdown]);

  const handleChange = (event: ChangeEvent<EditorTextarea>) => {
    resizeTextarea(event.currentTarget);
    onChange(event.target.value);
  };

  return { textareaRef, handleChange };
}
