import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Single source of truth for path aliases.
 * Both vite.config.ts and vitest.config.ts import this export to stay in sync.
 * Adding an alias here updates both the dev server and the test runner at once.
 */
export const alias: Record<string, string> = {
  "@": path.resolve(projectRoot, "./src"),
  "@test": path.resolve(projectRoot, "./test"),
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const host = env.VITE_HOST?.trim() || "0.0.0.0";
  const port = Number(env.VITE_PORT?.trim() || 5173);
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : ["notebook.com"];

  return {
    plugins: [react()],
    resolve: { alias },
    server: {
      host,
      port,
      strictPort: true,
      allowedHosts,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET?.trim() || "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    // test block is intentionally absent — test config is owned by vitest.config.ts
  };
});
