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
