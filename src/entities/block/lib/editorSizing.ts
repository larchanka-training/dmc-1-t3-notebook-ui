const TEXT_BLOCK_MIN_HEIGHT_PX = 40;
const TEXT_BLOCK_MAX_HEIGHT_PX = 320;
const CODE_BLOCK_LINE_HEIGHT_PX = 22;
const CODE_BLOCK_VERTICAL_PADDING_PX = 20;
const CODE_BLOCK_MIN_LINES = 3;
const CODE_BLOCK_MAX_LINES = 14;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getTextBlockHeight(scrollHeight: number) {
  return clamp(scrollHeight, TEXT_BLOCK_MIN_HEIGHT_PX, TEXT_BLOCK_MAX_HEIGHT_PX);
}

export function isTextBlockScrollable(scrollHeight: number) {
  return scrollHeight > TEXT_BLOCK_MAX_HEIGHT_PX;
}

export function getCodeBlockHeight(source: string) {
  const lineCount = source.split("\n").length;
  const visibleLineCount = clamp(lineCount, CODE_BLOCK_MIN_LINES, CODE_BLOCK_MAX_LINES);
  return `${visibleLineCount * CODE_BLOCK_LINE_HEIGHT_PX + CODE_BLOCK_VERTICAL_PADDING_PX}px`;
}

export function getCodeBlockMaxHeight() {
  return `${CODE_BLOCK_MAX_LINES * CODE_BLOCK_LINE_HEIGHT_PX + CODE_BLOCK_VERTICAL_PADDING_PX}px`;
}

export function getCodeBlockMinHeight() {
  return `${CODE_BLOCK_MIN_LINES * CODE_BLOCK_LINE_HEIGHT_PX + CODE_BLOCK_VERTICAL_PADDING_PX}px`;
}
