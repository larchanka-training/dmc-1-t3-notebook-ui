export type TextBlock = {
  id: string;
  type: "text";
  content: {
    markdown: string;
  };
};

export type CodeBlock = {
  id: string;
  type: "code";
  content: {
    language: "javascript";
    source: string;
  };
};

export type NotebookBlock = TextBlock | CodeBlock;

export type Notebook = {
  id: string;
  title: string;
  blocks: NotebookBlock[];
  revision: number;
  createdAt: string;
  updatedAt: string;
};
