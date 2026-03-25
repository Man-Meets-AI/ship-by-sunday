import { createCompleteProjectDefinition } from "../src";
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
			expect.arrayContaining(["apps/web", "packages/packet-compiler"]),
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

	it("materializes a repo snapshot with packet files", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const snapshotPaths = snapshotFiles.map((file) => file.path);

		expect(snapshotPaths).toEqual(
			expect.arrayContaining([
				"apps/web/config/product.ts",
				"apps/web/features/marketing/content/home.ts",
				"packet/README.md",
				"packet/build/docs/prompt.md",
			]),
		);
	});
});
