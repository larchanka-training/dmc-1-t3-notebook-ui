import { BlockAiAction, NotebookLocalAiStatus } from "@/features/ai";
import { NotebookEditorView } from "@/features/editor";
import { NotebookSidebar } from "@/features/notebooks";
import { useNotebookEditorPage } from "../model/useNotebookEditorPage";

export function NotebookEditorPage() {
  const { notebookId, isSidebarCollapsed, toggleSidebar, logout, logoutPending } =
    useNotebookEditorPage();

  return (
    <div className="flex h-full overflow-hidden bg-app text-ink">
      <NotebookSidebar
        activeNotebookId={notebookId}
        activeUtilityPath={null}
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        onLogout={logout}
        logoutPending={logoutPending}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <NotebookEditorView
          notebookId={notebookId}
          renderTopBarStatusSupplement={({ notebook, syncMeta }) => (
            <NotebookLocalAiStatus
              notebookId={notebook.id}
              serverNotebookId={syncMeta.serverId}
            />
          )}
          renderBlockActionSupplement={({ notebook, syncMeta, block, actions }) =>
            block.type === "text" ? (
              <BlockAiAction
                notebookId={notebook.id}
                serverNotebookId={syncMeta.serverId}
                notebookTitle={notebook.title}
                blocks={notebook.blocks}
                block={block}
                onInsertCode={actions.applyGeneratedCode}
              />
            ) : null
          }
        />
      </div>
    </div>
  );
}
