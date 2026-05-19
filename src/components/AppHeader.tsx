import { Link } from "react-router-dom";
import { useAppStore } from "../store";
import { Brand } from "./Brand";

export function AppHeader() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);

  return (
    <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-surface px-6">
      <Brand />
      {isAuthenticated && (
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link to="/notebooks" className="text-ink-muted hover:text-ink">
                Notebooks
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
