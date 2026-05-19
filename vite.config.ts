/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const host = env.VITE_HOST?.trim() || "0.0.0.0";
  const port = Number(env.VITE_PORT?.trim() || 5173);

  return {
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: true,
      allowedHosts: ["notebook.com"]
    },
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      include: ["src/**/*.test.{ts,tsx}"]
    }
  };
});
