import { describe, expect, it } from "vitest";

import {
	CORE_UX_BUILD_DEFAULT_CODEX_BRIEF,
	CORE_UX_BUILD_DEFAULT_STRATEGY_PROMPT,
	CORE_UX_BUILD_FIELD_IDS,
	CORE_UX_BUILD_HANDOFF_CHECKLIST_OPTIONS,
	CORE_UX_BUILD_ONBOARDING_CHECKLIST_OPTIONS,
	CORE_UX_BUILD_STRATEGY_FALLBACK_PROMPT,
} from "@/lib/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants";

describe("core-ux-build constants", () => {
	it("keeps stable field ids", () => {
		expect(CORE_UX_BUILD_FIELD_IDS.onboardingChecklist).toBe(
			"core_ux_onboarding_checklist",
		);
		expect(CORE_UX_BUILD_FIELD_IDS.strategyPrompt).toBe(
			"core_ux_strategy_prompt",
		);
	});

	it("seeds non-empty default prompts", () => {
		expect(CORE_UX_BUILD_DEFAULT_STRATEGY_PROMPT.trim().length).toBeGreaterThan(
			40,
		);
		expect(CORE_UX_BUILD_DEFAULT_CODEX_BRIEF.trim().length).toBeGreaterThan(20);
		expect(
			CORE_UX_BUILD_STRATEGY_FALLBACK_PROMPT.trim().length,
		).toBeGreaterThan(20);
	});

	it("keeps three onboarding lines and two handoff lines", () => {
		expect(CORE_UX_BUILD_ONBOARDING_CHECKLIST_OPTIONS).toHaveLength(3);
		expect(CORE_UX_BUILD_HANDOFF_CHECKLIST_OPTIONS).toHaveLength(2);
	});
});
