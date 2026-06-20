export type BlockMeta = {
  tags: string[];
};

export type TextBlock = {
  id: string;
  type: "text";
  content: {
    markdown: string;
  };
  meta?: BlockMeta;
};

export type CodeBlock = {
  id: string;
  type: "code";
  content: {
    language: "javascript";
    source: string;
  };
  meta?: BlockMeta;
};
