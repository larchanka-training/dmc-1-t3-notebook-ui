import { Link } from "react-router-dom";
import { useLogout } from "@/features/auth";
import { Brand, Button } from "@/shared/ui";
import { useAppStore } from "../model/store";

export function AppHeader() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const { logout, loading } = useLogout();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-token bg-surface px-token-24">
      <Brand />
      {isAuthenticated && (
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link to="/notebooks" className="text-ink-muted hover:text-ink">
                Notebooks
              </Link>
            </li>
            <li>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={loading}
              >
                {loading ? "Signing out…" : "Log out"}
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
