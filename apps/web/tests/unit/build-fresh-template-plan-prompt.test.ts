import { describe, expect, it } from "vitest";

import { buildFreshTemplatePlanPrompt } from "@/features/course/lesson/workbench/modes/fresh-template-plan/build-fresh-template-plan-prompt";

describe("buildFreshTemplatePlanPrompt", () => {
  it("joins body and reasoning with no optional sections when stack is empty", () => {
    expect(
      buildFreshTemplatePlanPrompt({
        manualBody: "Don't start coding yet.",
        reasoning: "medium",
        referencePath: "",
        includeConvex: false,
        includeNextjs: false,
        includeClerk: false,
        includeStripe: false,
        stackOther: "",
      }),
    ).toBe("Don't start coding yet.\n\nReasoning depth: Medium (medium).");
  });

  it("includes reference path and stack bullets when set", () => {
    const out = buildFreshTemplatePlanPrompt({
      manualBody: "Plan only.",
      reasoning: "high",
      referencePath: "/Users/dev/ref",
      includeConvex: true,
      includeNextjs: true,
      includeClerk: false,
      includeStripe: false,
      stackOther: "Bunny Stream",
    });
    expect(out).toContain("Reference codebase (local path): /Users/dev/ref");
    expect(out).toContain("- Convex");
    expect(out).toContain("- Next.js");
    expect(out).toContain("- Other: Bunny Stream");
    expect(out).toContain("Reasoning depth: High (high).");
  });

  it("returns meta only when manual body is blank", () => {
    expect(
      buildFreshTemplatePlanPrompt({
        manualBody: "   ",
        reasoning: "extra_high",
        referencePath: "",
        includeConvex: false,
        includeNextjs: false,
        includeClerk: false,
        includeStripe: false,
        stackOther: "",
      }),
    ).toBe("Reasoning depth: Extra high (extra_high).");
  });
});
