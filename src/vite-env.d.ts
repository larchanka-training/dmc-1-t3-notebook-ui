/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST?: string;
  readonly VITE_PORT?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_WEBLLM_LOCAL_MODE_ENABLED?: string;
  readonly VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY?: string;
  readonly VITE_WEBLLM_MODEL?: string;
  readonly VITE_WEBLLM_BOOTSTRAP_TIMEOUT_MS?: string;
  readonly VITE_WEBLLM_MODULE_SPECIFIER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
