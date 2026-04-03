import { createCompleteProjectDefinition } from "../src";
import { isExcludedSnapshotPath } from "../src/repo-generation/repo-download-source-contract";
import {
	buildRepoGenerationManifest,
	materializeRepoSnapshot,
	renderTemplateOverrides,
} from "../src/server";

describe("repo generation", () => {
	it("builds a repo manifest from the project definition", () => {
		const manifest = buildRepoGenerationManifest(
			createCompleteProjectDefinition(),
		);

		expect(manifest.repoName).toBe("ship-by-sunday-os");
		expect(manifest.excludedPathSegments).toEqual(
			expect.arrayContaining([".next", ".vercel", "coverage", "test-results"]),
		);
		expect(manifest.includedDirectories).toEqual(
			expect.arrayContaining([
				"apps/web/app",
				"apps/web/tests",
				"packages/blueprint-compiler/src",
				"packages/blueprint-compiler/tests",
			]),
		);
		expect(manifest.includedFiles).toEqual(
			expect.arrayContaining([
				"bunfig.toml",
				".plans/PLANS.md",
				"apps/web/.env.local.example",
			]),
		);
	});

	it("renders starter overrides for product config and home content", () => {
		const overrides = renderTemplateOverrides(
			createCompleteProjectDefinition(),
		);
		const overridePaths = overrides.map((file) => file.path);

		expect(overridePaths).toEqual(
			expect.arrayContaining([
				"README.md",
				"apps/web/config/product.ts",
				"apps/web/features/marketing/content/home.ts",
			]),
		);
	});

	it("materializes a customer-safe repo snapshot", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const snapshotPaths = snapshotFiles.map((file) => file.path);

		expect(snapshotPaths).toEqual(
			expect.arrayContaining([
				"apps/web/config/product.ts",
				"apps/web/features/marketing/content/home.ts",
				"docs/README.md",
				"docs/build/docs/prompt.md",
				".plans/PLANS.md",
				"apps/web/.env.production.example",
				"qa/README.md",
				".agents/README.md",
				".github/workflows/examples/basic-ci.example.yml",
			]),
		);
		const forbiddenPaths = snapshotPaths.filter((path) =>
			isExcludedSnapshotPath(path),
		);
		expect(forbiddenPaths).toEqual([]);
	});
});
