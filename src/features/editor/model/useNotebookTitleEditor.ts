import { useEffect, useState } from "react";
import { normalizeNotebookTitle } from "@/entities/notebook";

type UseNotebookTitleEditorOptions = {
  title: string;
  canRename: boolean;
  onRename: (title: string) => Promise<void>;
};

export function useNotebookTitleEditor({
  title,
  canRename,
  onRename,
}: UseNotebookTitleEditorOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(title);
    }
  }, [isEditing, title]);

  const startEditing = () => {
    if (!canRename) {
      return;
    }
    setDraftTitle(title);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftTitle(title);
    setError(null);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const submit = async () => {
    const nextTitle = normalizeNotebookTitle(draftTitle);
    if (nextTitle === title) {
      cancelEditing();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRename(nextTitle);
      setDraftTitle(nextTitle);
      setIsEditing(false);
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : "Failed to rename notebook.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    draftTitle,
    isEditing,
    isSubmitting,
    error,
    canRename,
    setDraftTitle: (nextTitle: string) => {
      setDraftTitle(nextTitle);
      if (error) {
        setError(null);
      }
    },
    startEditing,
    cancelEditing,
    submit,
  };
}
