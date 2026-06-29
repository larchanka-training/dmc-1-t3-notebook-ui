import type { ReactNode } from "react";
import { NotebookSidebar } from "@/features/notebooks";
import { Card, CardContent, CardHeader } from "@/shared/ui";
import { useHelpPage } from "../model/useHelpPage";

function renderInlineText(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((segment, index) => {
    if (segment.startsWith("`") && segment.endsWith("`") && segment.length >= 2) {
      return (
        <code
          key={`${segment}-${index}`}
          className="rounded bg-editor px-1.5 py-0.5 font-mono text-[0.9375em] text-ink"
        >
          {segment.slice(1, -1)}
        </code>
      );
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
}

export function HelpPage() {
  const { sections, isSidebarCollapsed, toggleSidebar, logout, logoutPending } =
    useHelpPage();

  return (
    <div className="flex h-full overflow-hidden bg-app text-ink">
      <NotebookSidebar
        activeNotebookId={null}
        activeUtilityPath="help"
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        onLogout={logout}
        logoutPending={logoutPending}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header
            className="rounded-3xl border border-border-token bg-gradient-to-br from-surface via-background to-editor px-6 py-8 shadow-sm"
            aria-label="Help page header"
          >
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
              Product guide
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              Help
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-muted sm:text-base">
              Start here when you need a quick explanation of how notebooks, blocks,
              execution, sync, and AI assistance work in Version 1.
            </p>
          </header>

          <section className="grid gap-4 pb-8" aria-label="Help content">
            {sections.map((section) => (
              <Card
                key={section.title}
                className="border-border-token bg-background/95 shadow-sm"
              >
                <CardHeader className="pb-4">
                  <h2 className="text-xl font-semibold leading-none tracking-tight text-ink">
                    {section.title}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-ink-muted sm:text-base">
                  {section.blocks.map((block, blockIndex) => {
                    if (block.kind === "paragraph") {
                      return (
                        <p key={`${section.title}-${blockIndex}`}>
                          {renderInlineText(block.text)}
                        </p>
                      );
                    }

                    const ListTag = block.kind === "ordered-list" ? "ol" : "ul";

                    return (
                      <ListTag
                        key={`${section.title}-${blockIndex}`}
                        className="space-y-2 pl-5 marker:text-ink"
                      >
                        {block.items.map((item) => (
                          <li key={item}>{renderInlineText(item)}</li>
                        ))}
                      </ListTag>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
