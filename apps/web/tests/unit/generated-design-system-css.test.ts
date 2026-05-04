import {
	buildDesignPresetFactSeed,
	buildGeneratedDesignSystem,
} from "@shipbysunday/codebase-compiler";
import { describe, expect, it } from "vitest";

import { buildGeneratedDesignSystemCss } from "@/lib/generated-design-system-css";

function buildDesignSystemForPreset(presetId: string) {
	return buildGeneratedDesignSystem({
		product_name: "Test Product",
		product_summary: "A focused product summary.",
		primary_user: "Operators",
		problem_statement: "The current system is hard to verify.",
		success_looks_like: "The generated design system is deterministic.",
		outcome_statement: "A generated app with reliable semantic tokens.",
		core_flow: ["Configure", "Review", "Ship"],
		theme_preset: buildDesignPresetFactSeed(presetId).theme_preset,
		copy_tone: "Clear and direct.",
	});
}

describe("buildGeneratedDesignSystemCss", () => {
	it("scopes generated light tokens to non-dark documents", () => {
		const css = buildGeneratedDesignSystemCss(buildDesignSystemForPreset("a0"));

		expect(css).toContain(":root:not(.dark) {");
		expect(css).not.toContain(":root {\n");
		expect(css).toContain(".dark {");
	});

	it("lets global dark shadcn tokens win when a preset has no dark-mode opinion", () => {
		const defaultCss = buildGeneratedDesignSystemCss(
			buildDesignSystemForPreset("a0"),
		);
		const alternateCss = buildGeneratedDesignSystemCss(
			buildDesignSystemForPreset("notion"),
		);

		expect(defaultCss).not.toMatch(/\.dark \{[\s\S]*--primary:/);
		expect(defaultCss).not.toMatch(/\.dark \{[\s\S]*--primary-foreground:/);
		expect(alternateCss).not.toMatch(/\.dark \{[\s\S]*--primary:/);
		expect(alternateCss).not.toMatch(/\.dark \{[\s\S]*--primary-foreground:/);
	});
});
