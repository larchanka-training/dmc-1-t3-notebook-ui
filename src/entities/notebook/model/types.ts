import type { CodeBlock, TextBlock } from "@/entities/block";

export type NotebookBlock = TextBlock | CodeBlock;

export type Notebook = {
  id: string;
  title: string;
  blocks: NotebookBlock[];
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type { CodeBlock, TextBlock };
