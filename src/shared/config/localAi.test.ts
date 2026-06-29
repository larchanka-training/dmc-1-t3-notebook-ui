import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalAiRuntimeConfig } from "./localAi";

describe("getLocalAiRuntimeConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults WebLLM rollout to disabled", () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "");

    const config = getLocalAiRuntimeConfig();

    expect(config.rolloutPolicy).toBe("disabled");
    expect(config.enabled).toBe(false);
  });

  it("enables local mode only for explicit public opt-in", () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "public-opt-in");

    const config = getLocalAiRuntimeConfig();

    expect(config.rolloutPolicy).toBe("public-opt-in");
    expect(config.enabled).toBe(true);
  });

  it("falls back to disabled when rollout policy is invalid", () => {
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ENABLED", "true");
    vi.stubEnv("VITE_WEBLLM_LOCAL_MODE_ROLLOUT_POLICY", "surprise-me");

    const config = getLocalAiRuntimeConfig();

    expect(config.rolloutPolicy).toBe("disabled");
    expect(config.enabled).toBe(false);
  });
});
