export interface StoreNotebookBlock {
  id: string;
  type: "text" | "code";
  content: string;
  order: number;
}

export interface ActiveNotebookSlice {
  activeNotebook: {
    notebookId: string | null;
    blocks: StoreNotebookBlock[];
    dirty: boolean;
  };
}

export interface BlockUiSlice {
  blockUi: {
    selectedBlockId: string | null;
    focusedBlockId: string | null;
    toolbarOpenForBlockId: string | null;
    aiPromptOpenForBlockId: string | null;
  };
}
