/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const port = Number(env.VITE_PORT || 5173);

  return {
    plugins: [react()],
    server: {
      host: env.VITE_HOST || "0.0.0.0",
      port,
      strictPort: true
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
