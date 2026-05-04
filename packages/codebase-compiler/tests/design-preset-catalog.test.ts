import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	designPresetDefinitions,
	getDesignPresetDefinition,
} from "../src";
import { resolveRepoRootPath } from "../src/repo-root";

describe("design preset catalog", () => {
	it("ships the curated preset catalog with stable ids", () => {
		expect(designPresetDefinitions).toHaveLength(8);
		expect(designPresetDefinitions.map((preset) => preset.id)).toEqual([
			"vercel",
			"linear",
			"notion",
			"stripe",
			"supabase",
			"framer",
			"raycast",
			"cursor",
		]);
	});

	it("builds a default fact seed from the default preset", () => {
		const defaultSeed = buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID);

		expect(defaultSeed.design_preset_id).toBe(DEFAULT_DESIGN_PRESET_ID);
		expect(defaultSeed.theme_preset).toBeTruthy();
		expect(defaultSeed.design_references).toEqual([
			"https://getdesign.md/vercel/design-md",
		]);
		expect(getDesignPresetDefinition(DEFAULT_DESIGN_PRESET_ID)?.label).toBe(
			"Vercel",
		);
	});

	it("points every preset asset path at a real vendored file", () => {
		const repoRootPath = resolveRepoRootPath();

		for (const preset of designPresetDefinitions) {
			const logoPath = path.join(
				repoRootPath,
				"apps/web/public",
				preset.logoPath.replace(/^\//u, ""),
			);
			const previewPath = path.join(
				repoRootPath,
				"apps/web/public",
				preset.previewImagePath.replace(/^\//u, ""),
			);
			expect(
				existsSync(logoPath),
				`${preset.id} logo asset missing at ${logoPath}`,
			).toBe(true);
			expect(
				existsSync(previewPath),
				`${preset.id} preview asset missing at ${previewPath}`,
			).toBe(true);
		}
	});
});
