import { afterEach, describe, expect, it, vi } from "vitest";

import { areDebugToolsEnabled } from "@/lib/app/debug-tools";

describe("debug tools gating", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays disabled unless the explicit flag is enabled", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_DEBUG_TOOLS", "");

    expect(areDebugToolsEnabled()).toBe(false);
  });

  it("enables debug tools only outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_DEBUG_TOOLS", "true");

    expect(areDebugToolsEnabled()).toBe(true);
  });

  it("keeps debug tools disabled in production even if the flag is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_DEBUG_TOOLS", "true");

    expect(areDebugToolsEnabled()).toBe(false);
  });
});
