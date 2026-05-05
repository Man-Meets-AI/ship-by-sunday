import { createCompleteProjectDefinition } from "../src";
import { isExcludedSnapshotPath } from "../src/repo-generation/repo-download-source-contract";
import {
	buildRepoGenerationManifest,
	materializeRepoSnapshot,
	renderTemplateOverrides,
} from "../src/server";

const unresolvedCriticalPlaceholderPattern =
	/\[(?! )[A-Z][^\]\n]*\]|\[[^\]\n]*\.\.\.[^\]\n]*\]/;

function splitMarkdownTableRow(row: string) {
	return row
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim());
}

function parseMarkdownTable(content: string, firstHeader: string) {
	const lines = content.split("\n");
	const headerIndex = lines.findIndex(
		(line) =>
			line.startsWith("|") && splitMarkdownTableRow(line)[0] === firstHeader,
	);

	expect(headerIndex).toBeGreaterThanOrEqual(0);

	const headers = splitMarkdownTableRow(lines[headerIndex] ?? "");
	const rows: Record<string, string>[] = [];

	for (const line of lines.slice(headerIndex + 2)) {
		if (!line.startsWith("|")) {
			break;
		}

		const cells = splitMarkdownTableRow(line);
		rows.push(
			Object.fromEntries(
				headers.map((header, index) => [header, cells[index] ?? ""]),
			),
		);
	}

	return rows;
}

function stripInlineCode(value: string) {
	return value.replace(/^`|`$/g, "");
}

function snapshotText(file: { content: string | Buffer } | undefined) {
	if (!file) {
		return "";
	}

	return typeof file.content === "string"
		? file.content
		: file.content.toString();
}

function extractSkillTriggers(content: string) {
	return Array.from(
		content.matchAll(/\$[a-z][a-z0-9-]*/g),
		(match) => match[0],
	);
}

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
				"packages/codebase-compiler/src",
			]),
		);
		expect(manifest.includedFiles).toEqual(
			expect.arrayContaining(["bunfig.toml", "apps/web/.env.local.example"]),
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
				".agents/skills/starter-linear-workflow/SKILL.md",
				".agents/skills/starter-billing-setup/SKILL.md",
				".agents/skills/starter-first-slice/SKILL.md",
				".agents/skills/starter-product-copy/SKILL.md",
				".agents/skills/starter-frontend-design/SKILL.md",
				".agents/skills/starter-docs-and-testing/SKILL.md",
				".agents/skills/starter-nextjs-in-this-repo/SKILL.md",
				".agents/skills/starter-convex-in-this-repo/SKILL.md",
				".agents/skills/external-skills.json",
				"apps/web/content/docs/index.mdx",
				"README.md",
				"package.json",
				"apps/web/config/product.ts",
				"apps/web/app/_content/home-page.ts",
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
		expect(readmeOverride?.content).toContain("$starter-linear-workflow");
		expect(readmeOverride?.content).toContain(
			"`apps/web/config/generated-design-system.ts` contains the generated runtime design system.",
		);
		expect(onboardingOverride?.content).toContain(
			"Set up Linear as your work tracker",
		);
		expect(onboardingOverride?.content).toContain("$starter-linear-workflow");
		expect(onboardingOverride?.content).toContain(
			"Problem, Outcome, Acceptance Criteria, Validation, and Source",
		);
		expect(onboardingOverride?.content).toContain("$starter-billing-setup");
		expect(onboardingOverride?.content).toContain("$clerk");
		expect(onboardingOverride?.content).toContain("$stripe-best-practices");
		expect(onboardingOverride?.content).toContain("$starter-product-copy");
		expect(onboardingOverride?.content).toContain("$starter-frontend-design");
		expect(onboardingOverride?.content).toContain("$starter-docs-and-testing");
		expect(onboardingOverride?.content).toContain("Run core setup");
		expect(onboardingOverride?.content).toContain("Run auth setup");
		expect(onboardingOverride?.content).toContain("Run billing setup");
		expect(bootstrapOverride?.content).toContain(
			"If you use Linear, run \\$starter-linear-workflow before implementation.",
		);
		expect(bootstrapOverride?.content).toContain(
			"Follow START-HERE.md in order: \\$starter-core-setup, then \\$starter-auth-setup, then \\$starter-billing-setup.",
		);
		expect(packageJson.scripts.bootstrap).toBe("bash ./bootstrap.sh");
		expect(packageJson.scripts["codex:skills:install"]).toBe(
			"bash ./scripts/install-codex-skills.sh",
		);
		expect(packageJson.scripts["test:compiler"]).toBe(
			"bun run --cwd packages/codebase-compiler test",
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
				".agents/skills/starter-linear-workflow/SKILL.md",
				".agents/skills/starter-billing-setup/SKILL.md",
				".agents/skills/starter-product-copy/SKILL.md",
				".agents/skills/starter-frontend-design/SKILL.md",
				".agents/skills/starter-docs-and-testing/SKILL.md",
				".agents/skills/external-skills.json",
				"apps/web/content/docs/index.mdx",
				"apps/web/config/product.ts",
				"apps/web/config/generated-design-system.ts",
				"apps/web/app/_content/home-page.ts",
				"docs/index.md",
				"docs/build/docs/agent-handoff.md",
				"docs/build/docs/readiness.md",
				"docs/build/docs/review.md",
				"docs/build/docs/prompt.md",
				"docs/facts/design-system.json",
				"apps/web/.env.production.example",
				"docs/testing/README.md",
				".agents/README.md",
				".github/workflows/examples/basic-ci.example.yml",
			]),
		);
		expect(snapshotPaths).not.toEqual(
			expect.arrayContaining(["docs/PLANS.md", "docs/exec-plans/PLANS.md"]),
		);
		const forbiddenPaths = snapshotPaths.filter((path) =>
			isExcludedSnapshotPath(path),
		);
		const rootAgentGuide = snapshotFiles.find(
			(file) => file.path === "AGENTS.md",
		);
		const appAgentGuide = snapshotFiles.find(
			(file) => file.path === "apps/web/AGENTS.md",
		);
		const linearWorkflowSkill = snapshotFiles.find(
			(file) => file.path === ".agents/skills/starter-linear-workflow/SKILL.md",
		);

		expect(rootAgentGuide?.content).toContain("docs/build/docs/prompt.md");
		expect(rootAgentGuide?.content).toContain(
			"requirement-to-evidence checklist",
		);
		expect(appAgentGuide?.content).toContain(
			"docs/facts/project-definition.json",
		);
		expect(appAgentGuide?.content).toContain(
			"Keep UI rendering, route orchestration, domain logic, and provider I/O in separate files",
		);
		expect(linearWorkflowSkill?.content).toContain(
			"Use Linear for backlog state",
		);
		expect(linearWorkflowSkill?.content).toContain(
			"Problem, Outcome, Acceptance Criteria, Validation, and Source",
		);
		expect(forbiddenPaths).toEqual([]);
	});

	it("keeps every generated skill trigger backed by a shipped or installable skill", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const onboarding = snapshotText(
			snapshotFiles.find((file) => file.path === "START-HERE.md"),
		);
		const wrapperSkillTriggers = new Set(
			snapshotFiles
				.map((file) => file.path)
				.filter(
					(path) =>
						path.startsWith(".agents/skills/") && path.endsWith("/SKILL.md"),
				)
				.map((path) => `$${path.split("/").at(-2) ?? ""}`),
		);
		const externalSkillsManifest = JSON.parse(
			snapshotText(
				snapshotFiles.find(
					(file) => file.path === ".agents/skills/external-skills.json",
				),
			) || "{}",
		) as {
			externalSkills?: { recommendedTriggers?: string[] }[];
		};
		const externalSkillTriggers = new Set(
			(externalSkillsManifest.externalSkills ?? []).flatMap(
				(entry) => entry.recommendedTriggers ?? [],
			),
		);
		const unresolvedTriggers = extractSkillTriggers(onboarding).filter(
			(trigger) =>
				!wrapperSkillTriggers.has(trigger) &&
				!externalSkillTriggers.has(trigger),
		);

		expect(unresolvedTriggers).toEqual([]);
		expect(onboarding).not.toContain("$copywriting");
		expect(onboarding).not.toContain("$frontend-design");
		expect(onboarding).not.toContain("$testing-practices");
	});

	it("materializes a build pack an agent can start from without chat history", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const buildPrompt = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/prompt.md",
		);
		const agentHandoff = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/agent-handoff.md",
		);
		const buildReadiness = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/readiness.md",
		);
		const buildReview = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/review.md",
		);
		const buildPlans = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/plans.md",
		);
		const buildDocumentation = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/documentation.md",
		);
		const buildImplement = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/implement.md",
		);
		const rootAgentGuide = snapshotFiles.find(
			(file) => file.path === "AGENTS.md",
		);

		expect(rootAgentGuide?.content).toContain(
			"For product build work, read `docs/build/docs/agent-handoff.md` first",
		);
		expect(agentHandoff?.content.indexOf("## Readiness First")).toBeLessThan(
			agentHandoff?.content.indexOf("## Start Prompt") ??
				Number.MAX_SAFE_INTEGER,
		);
		expect(agentHandoff?.content).toContain("## Start Prompt");
		expect(agentHandoff?.content).toContain("## Required Source Files");
		expect(agentHandoff?.content).toContain("## Required Completion Evidence");
		expect(buildReadiness?.content).toContain("## Readiness Verdict");
		expect(buildReadiness?.content).toContain("## Derived First Slice Plan");
		expect(buildReadiness?.content).toContain("## Starter File Reading Order");
		expect(buildReadiness?.content).toContain("## Validation Manifest");
		expect(buildReadiness?.content).toContain("## Customer Input Work");
		expect(buildReadiness?.content).toContain("Confidence state:");
		expect(buildReadiness?.content).not.toContain("/Users/");
		expect(buildReadiness?.content).not.toContain("sk-");
		expect(buildReadiness?.content).not.toContain("current chat context");
		expect(buildPrompt?.content).toContain("## Authority Order");
		expect(buildPrompt?.content).toContain("## Implementation Target");
		expect(buildPrompt?.content).toContain("## Completion Audit Checklist");
		expect(buildPrompt?.content).toContain("## Copy-Ready Agent Prompt");
		expect(buildPlans?.content).toContain("## Active Milestone Selection");
		expect(buildPlans?.content).toContain("## Detailed Milestone Plans");
		expect(buildImplement?.content).toContain("## Source Of Truth");
		expect(buildImplement?.content).toContain("## Preflight Checklist");
		expect(buildImplement?.content).toContain("## Typed Validation Manifest");
		expect(buildReview?.content).toContain("## Review Prompt");
		expect(buildReview?.content).toContain("## Verification Personas");
		expect(buildReview?.content).toContain("docs/testing/run-report.md");
		expect(buildReview?.content).toContain("## Evidence Table");
		expect(buildDocumentation?.content).toContain("## Current Status");
		expect(buildDocumentation?.content).toContain(
			"## Requirement-To-Evidence Checklist",
		);

		for (const buildDoc of [
			agentHandoff,
			buildReadiness,
			buildReview,
			buildPrompt,
			buildPlans,
			buildImplement,
			buildDocumentation,
		]) {
			expect(buildDoc?.content).not.toContain("## Base Template");
			expect(buildDoc?.content).not.toMatch(
				unresolvedCriticalPlaceholderPattern,
			);
		}
	});

	it("clean-room replays the generated build pack command manifest", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const readiness = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/readiness.md",
		);
		const review = snapshotFiles.find(
			(file) => file.path === "docs/build/docs/review.md",
		);
		const packageJsonFile = snapshotFiles.find(
			(file) => file.path === "package.json",
		);

		expect(readiness).toBeDefined();
		expect(review).toBeDefined();
		expect(packageJsonFile).toBeDefined();

		const packageJson = JSON.parse(snapshotText(packageJsonFile) || "{}") as {
			scripts?: Record<string, string>;
		};
		const scripts = packageJson.scripts ?? {};
		const validationRows = parseMarkdownTable(
			snapshotText(readiness),
			"Source validation step",
		);
		const runnableRows = validationRows.filter(
			(row) => row.Type === "runnable",
		);

		expect(runnableRows.length).toBeGreaterThan(0);
		for (const row of runnableRows) {
			const scriptName = stripInlineCode(row["Package script"] ?? "");
			const proofPath = stripInlineCode(row["Proof path"] ?? "");

			expect(scriptName).not.toBe("n/a");
			expect(scripts[scriptName]).toBeDefined();
			expect(proofPath).toBe(`bun run ${scriptName}`);
		}

		expect(snapshotText(readiness)).toContain("## Blockers");
		expect(snapshotText(readiness)).toContain("## Weak Fact Warnings");
		expect(snapshotText(readiness)).toContain("## Ask Customer Before");
		expect(snapshotText(review)).toContain("## Regression Checks");
		expect(snapshotText(review)).toContain(
			"| Item | Evidence source | Status | Notes |",
		);
		expect(snapshotText(review)).not.toContain("current chat context");
	});
});
