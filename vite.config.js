import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, ".", "");
    var port = Number(env.VITE_PORT || 5173);
    return {
        plugins: [react()],
        server: {
            host: env.VITE_HOST || "0.0.0.0",
            port: port,
            strictPort: true
        }
    };
});
