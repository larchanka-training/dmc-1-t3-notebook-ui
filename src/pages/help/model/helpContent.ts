import helpContentMarkdown from "../../../../docs/help_content.md?raw";

export type HelpBlock =
  | {
      kind: "paragraph";
      text: string;
    }
  | {
      kind: "unordered-list" | "ordered-list";
      items: string[];
    };

export type HelpSection = {
  title: string;
  blocks: HelpBlock[];
};

function extractDraftContent(markdown: string): string {
  const startMarker = "## Draft User-Facing Copy";
  const endMarker = "## Content Notes For Future UI Implementation";
  const startIndex = markdown.indexOf(startMarker);
  const endIndex = markdown.indexOf(endMarker);

  if (startIndex === -1) {
    return markdown.trim();
  }

  const contentStart = startIndex + startMarker.length;
  const contentEnd = endIndex === -1 ? markdown.length : endIndex;

  return markdown.slice(contentStart, contentEnd).trim();
}

function parseBlock(lines: string[]): HelpBlock | null {
  if (lines.length === 0) {
    return null;
  }

  if (lines.every((line) => line.startsWith("- "))) {
    return {
      kind: "unordered-list",
      items: lines.map((line) => line.slice(2).trim()).filter(Boolean),
    };
  }

  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return {
      kind: "ordered-list",
      items: lines.map((line) => line.replace(/^\d+\.\s*/, "").trim()).filter(Boolean),
    };
  }

  return {
    kind: "paragraph",
    text: lines.join(" ").trim(),
  };
}

function parseHelpSections(markdown: string): HelpSection[] {
  const lines = extractDraftContent(markdown)
    .split("\n")
    .map((line) => line.trimEnd());
  const sections: HelpSection[] = [];
  let currentSection: HelpSection | null = null;
  let currentBlockLines: string[] = [];

  function flushBlock() {
    if (!currentSection) {
      currentBlockLines = [];
      return;
    }

    const block = parseBlock(currentBlockLines);
    if (block) {
      currentSection.blocks.push(block);
    }
    currentBlockLines = [];
  }

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flushBlock();

      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line.slice(4).trim(),
        blocks: [],
      };
      continue;
    }

    if (!currentSection) {
      continue;
    }

    if (line.trim() === "") {
      flushBlock();
      continue;
    }

    currentBlockLines.push(line.trim());
  }

  flushBlock();

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

export const helpSections = parseHelpSections(helpContentMarkdown);
