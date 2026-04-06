import { describe, expect, it } from "vitest";
import {
	buildGeneratedDesignSystem,
	createCompleteProjectDefinition,
	renderGeneratedDesignMarkdown,
} from "../src";

describe("generated design system", () => {
	it("derives a portable design system from the theme preset", () => {
		const designSystem = buildGeneratedDesignSystem(
			createCompleteProjectDefinition({
				facts: {
					product_name: "Signal Desk",
					primary_user: "Operations leads",
					theme_preset: "a0",
					visual_thesis: undefined,
				},
			}).facts,
		);

		expect(designSystem.preset.presetConfig.style).toBe("nova");
		expect(designSystem.preset.font.label).toBe("Inter");
		expect(designSystem.preset.tokens.light["--primary"]).toBeDefined();
		expect(designSystem.derivedFacts.visualThesis).toContain("Signal Desk");
		expect(designSystem.designPrinciples.length).toBeGreaterThan(2);
	});

	it("renders markdown with context, token, and anti-pattern sections", () => {
		const designSystem = buildGeneratedDesignSystem(
			createCompleteProjectDefinition().facts,
		);
		const markdown = renderGeneratedDesignMarkdown(designSystem);

		expect(markdown).toContain("# Design System");
		expect(markdown).toContain("## Users");
		expect(markdown).toContain("## Color Palette & Roles");
		expect(markdown).toContain("## Do's and Don'ts");
		expect(markdown).toContain("### Don't");
		expect(markdown).toContain("cards inside cards");
	});
});
