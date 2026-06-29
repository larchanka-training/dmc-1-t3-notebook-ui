function parseBooleanFlag(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return fallback;
}

function parsePositiveInteger(raw: string | undefined, fallback: number): number {
  if (raw === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const LOCAL_AI_ROLLOUT_POLICIES = [
  "disabled",
  "dev-opt-in",
  "public-opt-in",
] as const;

export type LocalAiRolloutPolicy = (typeof LOCAL_AI_ROLLOUT_POLICIES)[number];

function parseRolloutPolicy(raw: string | undefined): LocalAiRolloutPolicy {
  if (raw === undefined) {
    return "disabled";
  }

  const normalized = raw.trim().toLowerCase();
  return LOCAL_AI_ROLLOUT_POLICIES.includes(normalized as LocalAiRolloutPolicy)
    ? (normalized as LocalAiRolloutPolicy)
    : "disabled";
}

export type LocalAiRuntimeConfig = {
  enabled: boolean;
  rolloutPolicy: LocalAiRolloutPolicy;
  modelId: string;
  bootstrapTimeoutMs: number;
  moduleSpecifier: string;
};

export function getLocalAiRuntimeConfig(): LocalAiRuntimeConfig {
  const rolloutPolicy = parseRolloutPolicy(
    import.meta.env.VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY,
  );
  const explicitOptIn = parseBooleanFlag(
    import.meta.env.VITE_WEBLLM_LOCAL_MODE_ENABLED,
    false,
  );
  const modelId =
    import.meta.env.VITE_WEBLLM_MODEL?.trim() ||
    "Llama-3.2-1B-Instruct-q4f32_1-MLC";
  const moduleSpecifier =
    import.meta.env.VITE_WEBLLM_MODULE_SPECIFIER?.trim() || "@mlc-ai/web-llm";
  const enabled =
    explicitOptIn &&
    (rolloutPolicy === "public-opt-in" ||
      (rolloutPolicy === "dev-opt-in" && import.meta.env.DEV));

  return {
    enabled,
    rolloutPolicy,
    modelId,
    bootstrapTimeoutMs: parsePositiveInteger(
      import.meta.env.VITE_WEBLLM_BOOTSTRAP_TIMEOUT_MS,
      120_000,
    ),
    moduleSpecifier,
  };
}
