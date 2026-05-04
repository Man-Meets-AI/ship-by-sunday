import { describe, expect, it } from "vitest";
import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	buildGeneratedDesignSystem,
	createCompleteProjectDefinition,
	deriveCodebaseFacts,
	renderGeneratedDesignMarkdown,
} from "../src";

describe("generated design system", () => {
	it("derives a portable design system from the theme preset", () => {
		const designSystem = buildGeneratedDesignSystem(
			createCompleteProjectDefinition({
				facts: {
					product_name: "Signal Desk",
					primary_user: "Operations leads",
					design_preset_id: DEFAULT_DESIGN_PRESET_ID,
					theme_preset: buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID)
						.theme_preset,
					visual_thesis: undefined,
				},
			}).facts,
		);

		expect(designSystem.selection.presetId).toBe(DEFAULT_DESIGN_PRESET_ID);
		expect(designSystem.selection.presetLabel).toBe("Vercel");
		expect(designSystem.preset.presetConfig.style).toBe("mira");
		expect(designSystem.preset.font.label).toBe("Geist");
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
		expect(markdown).toContain("## Preset Inspiration");
		expect(markdown).toContain("## Users");
		expect(markdown).toContain("## Color Palette & Roles");
		expect(markdown).toContain("## Do's and Don'ts");
		expect(markdown).toContain("### Don't");
		expect(markdown).toContain("cards inside cards");
	});

	it("marks a curated preset as customized when references diverge from the seed", () => {
		const designSystem = buildGeneratedDesignSystem(
			createCompleteProjectDefinition({
				facts: {
					design_preset_id: "notion",
					theme_preset: buildDesignPresetFactSeed("notion").theme_preset,
					design_references: ["https://example.com/custom-reference"],
				},
			}).facts,
		);

		expect(designSystem.selection.source).toBe("customized_catalog");
	});

	it("marks a raw custom theme code without a preset id as custom_code", () => {
		const designSystem = buildGeneratedDesignSystem({
			product_name: "Signal Desk",
			primary_user: "Operations leads",
			theme_preset: "custom-theme-code",
			design_references: ["https://example.com/custom-reference"],
		});

		expect(designSystem.selection.source).toBe("custom_code");
	});

	it("keeps custom_code provenance after canonical derivation", () => {
		const designSystem = buildGeneratedDesignSystem(
			deriveCodebaseFacts({
				product_name: "Signal Desk",
				primary_user: "Operations leads",
				theme_preset: "custom-theme-code",
			}),
		);

		expect(designSystem.selection.source).toBe("custom_code");
		expect(designSystem.selection.presetId).toBeUndefined();
		expect(designSystem.designReferences).not.toContain(
			"https://getdesign.md/vercel/design-md",
		);
	});
});
