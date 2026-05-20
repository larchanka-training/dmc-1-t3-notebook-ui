import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const host = env.VITE_HOST?.trim() || "0.0.0.0";
  const port = Number(env.VITE_PORT?.trim() || 5173);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "./src"),
      },
    },
    server: {
      host,
      port,
      strictPort: true,
      allowedHosts: ["notebook.com"],
    },
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./test/setup.ts"],
      css: false,
      include: ["src/**/*.test.{ts,tsx}"],
    },
  };
});
