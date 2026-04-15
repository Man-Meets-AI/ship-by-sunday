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
			]),
		);
		expect(manifest.includedFiles).toEqual(
			expect.arrayContaining([
				"bunfig.toml",
				"docs/exec-plans/PLANS.md",
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
				"START-HERE.md",
				"bootstrap.sh",
				"scripts/install-codex-skills.sh",
				".agents/skills/starter-core-setup/SKILL.md",
				".agents/skills/starter-auth-setup/SKILL.md",
				".agents/skills/starter-billing-setup/SKILL.md",
				".agents/skills/starter-first-slice/SKILL.md",
				".agents/skills/starter-nextjs-in-this-repo/SKILL.md",
				".agents/skills/starter-convex-in-this-repo/SKILL.md",
				".agents/skills/external-skills.json",
				"apps/web/content/docs/index.mdx",
				"README.md",
				"package.json",
				"apps/web/config/product.ts",
				"apps/web/features/marketing/content/home.ts",
			]),
		);

		const readmeOverride = overrides.find((file) => file.path === "README.md");
		const onboardingOverride = overrides.find(
			(file) => file.path === "START-HERE.md",
		);
		const bootstrapOverride = overrides.find(
			(file) => file.path === "bootstrap.sh",
		);
		const skillsManifestOverride = overrides.find(
			(file) => file.path === ".agents/skills/external-skills.json",
		);
		const packageOverride = overrides.find(
			(file) => file.path === "package.json",
		);
		const skillsManifest = JSON.parse(skillsManifestOverride?.content ?? "{}");
		const packageJson = JSON.parse(packageOverride?.content ?? "{}");

		expect(readmeOverride?.content).toContain("## First-Pass Checklist");
		expect(readmeOverride?.content).toContain("Open `START-HERE.md` first");
		expect(readmeOverride?.content).toContain(
			"Run `bun run codex:skills:install`",
		);
		expect(readmeOverride?.content).toContain("$starter-core-setup");
		expect(readmeOverride?.content).toContain(
			"`apps/web/config/generated-design-system.ts` contains the generated runtime design system.",
		);
		expect(onboardingOverride?.content).toContain("$starter-billing-setup");
		expect(onboardingOverride?.content).toContain("$clerk");
		expect(onboardingOverride?.content).toContain("$stripe-best-practices");
		expect(onboardingOverride?.content).toContain("Run core setup");
		expect(onboardingOverride?.content).toContain("Run auth setup");
		expect(onboardingOverride?.content).toContain("Run billing setup");
		expect(bootstrapOverride?.content).toContain(
			"Follow START-HERE.md in order: \\$starter-core-setup, then \\$starter-auth-setup, then \\$starter-billing-setup.",
		);
		expect(packageJson.scripts.bootstrap).toBe("bash ./bootstrap.sh");
		expect(packageJson.scripts["codex:skills:install"]).toBe(
			"bash ./scripts/install-codex-skills.sh",
		);
		expect(skillsManifest.externalSkills).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					installCommand: "npx skills add get-convex/agent-skills --all",
				}),
				expect.objectContaining({
					installCommand: "npx skills add clerk/skills",
				}),
				expect.objectContaining({
					installCommand:
						"npx skills add https://github.com/stripe/ai --skill stripe-best-practices",
				}),
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
				"DESIGN.md",
				"START-HERE.md",
				"bootstrap.sh",
				"scripts/install-codex-skills.sh",
				".agents/skills/starter-core-setup/SKILL.md",
				".agents/skills/starter-auth-setup/SKILL.md",
				".agents/skills/starter-billing-setup/SKILL.md",
				".agents/skills/external-skills.json",
				"apps/web/content/docs/index.mdx",
				"apps/web/config/product.ts",
				"apps/web/config/generated-design-system.ts",
				"apps/web/features/marketing/content/home.ts",
				"docs/README.md",
				"docs/build/docs/prompt.md",
				"docs/facts/design-system.json",
				"docs/exec-plans/PLANS.md",
				"apps/web/.env.production.example",
				"apps/web/tests/README.md",
				"apps/web/tests/utils/README.md",
				"apps/web/playwright/README.md",
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
