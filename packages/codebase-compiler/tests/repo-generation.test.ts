import { createCompleteProjectDefinition } from "../src";
import {
	isExcludedSnapshotPath,
	starterSnapshotForbiddenFilePaths,
	starterSnapshotForbiddenPathPrefixes,
} from "../src/repo-generation/repo-download-source-contract";
import {
	buildRepoGenerationManifest,
	materializeRepoSnapshot,
	renderTemplateOverrides,
} from "../src/server";
import { buildOperatingPackPaths } from "../src/repo-generation/render-starter-operating-pack";

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

function generatedOperatingPackPathSet(
	operatingPackPaths: ReturnType<typeof buildOperatingPackPaths>,
) {
	return new Set([
		"docs/programs/PROGRAMS.md",
		"docs/programs/active/index.md",
		"docs/programs/completed/index.md",
		operatingPackPaths.activeProgramPath,
		operatingPackPaths.planningBriefPath,
		operatingPackPaths.currentPlanningBriefPath,
		"docs/exec-plans/PLANS.md",
		"docs/exec-plans/active/index.md",
		"docs/exec-plans/completed/index.md",
		operatingPackPaths.activeExecPlanPath,
	]);
}

function expectNoForbiddenStarterSnapshotPaths(snapshotPaths: string[]) {
	const forbiddenPaths = snapshotPaths.filter(
		(path) =>
			starterSnapshotForbiddenFilePaths.includes(
				path as (typeof starterSnapshotForbiddenFilePaths)[number],
			) ||
			starterSnapshotForbiddenPathPrefixes.some((prefix) =>
				path.startsWith(prefix),
			),
	);

	expect(forbiddenPaths).toEqual([]);
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
			expect.arrayContaining(["packages/codebase-compiler/src"]),
		);
		expect(manifest.includedDirectories).not.toContain("apps/web/app");
		expect(manifest.includedDirectories).not.toContain("apps/web/tests");
		expect(manifest.includedFiles).toEqual(
			expect.arrayContaining([
				"bunfig.toml",
				"apps/web/.env.local.example",
				"apps/web/scripts/run-next-build-serialized.mjs",
			]),
		);
	});

	it("falls back to a safe repo name for product names without ascii slugs", () => {
		const manifest = buildRepoGenerationManifest(
			createCompleteProjectDefinition({
				facts: {
					product_name: "🚀",
				},
			}),
		);

		expect(manifest.repoName).toBe("generated-codebase");
	});

	it("renders untrusted product names without executable shell or mdx syntax", () => {
		const overrides = renderTemplateOverrides(
			createCompleteProjectDefinition({
				facts: {
					product_name: "Bad $(touch owned) `{mdx}` <script>",
				},
			}),
		);
		const bootstrap = snapshotText(
			overrides.find((file) => file.path === "bootstrap.sh"),
		);
		const docsIndex = snapshotText(
			overrides.find((file) => file.path === "apps/web/content/docs/index.mdx"),
		);

		expect(bootstrap).toContain(
			"PRODUCT_NAME='Bad $(touch owned) `{mdx}` <script>'",
		);
		expect(bootstrap).toContain(
			"Skipping shadcn preset apply because the generated preset code is invalid.",
		);
		expect(docsIndex).toContain(
			"Bad $(touch owned) `&#123;mdx&#125;` &lt;script&gt;",
		);
		expect(docsIndex).not.toContain("{mdx}");
		expect(docsIndex).not.toContain("<script>");
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
				"scripts/agentic/check-codebase-contract.mjs",
				"scripts/agentic/check-programs.mjs",
				"scripts/agentic/check-exec-plans.mjs",
				".agents/skills/starter-core-setup/SKILL.md",
				".agents/skills/starter-auth-setup/SKILL.md",
				".agents/skills/starter-linear-workflow/SKILL.md",
				".agents/skills/starter-operating-pack/SKILL.md",
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
		expect(readmeOverride?.content).toContain(
			"`apps/web/config/product.ts` contains the generated product config and questionnaire-derived homepage content.",
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
		expect(onboardingOverride?.content).toContain("apps/web/config/product.ts");
		expect(onboardingOverride?.content).not.toContain("_content");
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
		expect(packageJson.scripts["codebase:contract"]).toBe(
			"bun scripts/agentic/check-codebase-contract.mjs",
		);
		expect(packageJson.scripts["programs:lint"]).toBe(
			"bun scripts/agentic/check-programs.mjs",
		);
		expect(packageJson.scripts["plans:lint"]).toBe(
			"bun scripts/agentic/check-exec-plans.mjs",
		);
		expect(packageJson.scripts["agentic:check"]).toBe(
			"bun run programs:lint && bun run plans:lint",
		);
		expect(packageJson.scripts["test:compiler"]).toBe(
			"bun run codebase:contract",
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
		const projectDefinition = createCompleteProjectDefinition();
		const operatingPackPaths = buildOperatingPackPaths(projectDefinition);
		const snapshotFiles = await materializeRepoSnapshot(projectDefinition);
		const snapshotPaths = snapshotFiles.map((file) => file.path);
		const uniqueSnapshotPathCount = new Set(snapshotPaths).size;

		expect(snapshotPaths).toEqual(
			expect.arrayContaining([
				"DESIGN.md",
				"START-HERE.md",
				"bootstrap.sh",
				"scripts/install-codex-skills.sh",
				"scripts/agentic/check-codebase-contract.mjs",
				"scripts/agentic/check-programs.mjs",
				"scripts/agentic/check-exec-plans.mjs",
				".agents/skills/starter-core-setup/SKILL.md",
				".agents/skills/starter-auth-setup/SKILL.md",
				".agents/skills/starter-linear-workflow/SKILL.md",
				".agents/skills/starter-operating-pack/SKILL.md",
				".agents/skills/starter-billing-setup/SKILL.md",
				".agents/skills/starter-product-copy/SKILL.md",
				".agents/skills/starter-frontend-design/SKILL.md",
				".agents/skills/starter-docs-and-testing/SKILL.md",
				".agents/skills/external-skills.json",
				"apps/web/content/docs/index.mdx",
				"apps/web/src/app/globals.css",
				"apps/web/src/app/layout.tsx",
				"apps/web/src/app/(marketing)/page.tsx",
				"apps/web/config/product.ts",
				"apps/web/config/generated-design-system.ts",
				"apps/web/src/components/ui/button.tsx",
				"apps/web/src/app/(app)/dashboard/page.tsx",
				"apps/web/convex/schema.ts",
				"apps/web/next.config.ts",
				"apps/web/package.json",
				"apps/web/README.md",
				"apps/web/.env.local.example",
				"apps/web/scripts/run-next-build-serialized.mjs",
				"packages/codebase-presentation/package.json",
				"packages/codebase-presentation/src/index.ts",
				"packages/telegram-chat-widget/package.json",
				"packages/telegram-chat-widget/src/index.ts",
				"docs/index.md",
				"docs/build/docs/agent-handoff.md",
				"docs/build/docs/readiness.md",
				"docs/build/docs/review.md",
				"docs/build/docs/prompt.md",
				"docs/facts/design-system.json",
				"docs/facts/template-source.json",
				"apps/web/.env.production.example",
				"docs/testing/README.md",
				".agents/README.md",
				".github/workflows/examples/basic-ci.example.yml",
				"docs/programs/PROGRAMS.md",
				"docs/programs/active/index.md",
				"docs/programs/completed/index.md",
				operatingPackPaths.activeProgramPath,
				operatingPackPaths.planningBriefPath,
				operatingPackPaths.currentPlanningBriefPath,
				"docs/exec-plans/PLANS.md",
				"docs/exec-plans/active/index.md",
				"docs/exec-plans/completed/index.md",
				operatingPackPaths.activeExecPlanPath,
			]),
		);
		expect(uniqueSnapshotPathCount).toBe(snapshotPaths.length);
		expect(snapshotPaths).not.toEqual(
			expect.arrayContaining([
				"apps/web/app/(protected)/layout.tsx",
				"apps/web/app/(protected)/settings/_components/settings-page.tsx",
				"apps/web/app/blog/page.tsx",
				"apps/web/app/page.tsx",
				"apps/web/app/layout.tsx",
				"apps/web/src/app/_content/home-page.ts",
				"apps/web/src/app/api/billing/checkout/route.ts",
				"docs/PLANS.md",
				"docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md",
				"docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md",
				"docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md",
			]),
		);
		const forbiddenPaths = snapshotPaths.filter((path) =>
			isExcludedSnapshotPath(
				path,
				generatedOperatingPackPathSet(operatingPackPaths),
			),
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
		const basicCiWorkflow = snapshotText(
			snapshotFiles.find(
				(file) =>
					file.path === ".github/workflows/examples/basic-ci.example.yml",
			),
		);
		const appPackageJson = JSON.parse(
			snapshotText(
				snapshotFiles.find((file) => file.path === "apps/web/package.json"),
			) || "{}",
		) as {
			scripts?: Record<string, string>;
		};
		const appScriptBody = Object.values(appPackageJson.scripts ?? {}).join(
			"\n",
		);
		const appLocalEnvExample = snapshotText(
			snapshotFiles.find((file) => file.path === "apps/web/.env.local.example"),
		);
		const appProductionEnvExample = snapshotText(
			snapshotFiles.find(
				(file) => file.path === "apps/web/.env.production.example",
			),
		);
		const productConfigSource = snapshotText(
			snapshotFiles.find((file) => file.path === "apps/web/config/product.ts"),
		);
		const marketingPage = snapshotText(
			snapshotFiles.find(
				(file) => file.path === "apps/web/src/app/(marketing)/page.tsx",
			),
		);
		const appReadme = snapshotText(
			snapshotFiles.find((file) => file.path === "apps/web/README.md"),
		);
		const templateSourceProvenance = JSON.parse(
			snapshotText(
				snapshotFiles.find(
					(file) => file.path === "docs/facts/template-source.json",
				),
			) || "{}",
		) as {
			schemaVersion?: string;
			templateId?: string;
			templateVersion?: string;
			materializedOutputRoot?: string;
			generatedOverlaysWin?: boolean;
			contentDigest?: string;
			provenance?: Record<string, unknown>;
		};
		const appSnapshotText = snapshotFiles
			.filter((file) => file.path.startsWith("apps/web/"))
			.map(snapshotText)
			.join("\n");

		expect(rootAgentGuide?.content).toContain("docs/build/docs/prompt.md");
		expect(rootAgentGuide?.content).toContain("bun run agentic:check");
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
		expect(basicCiWorkflow).toContain("      - run: bun ci");
		expect(basicCiWorkflow).toContain("      - run: bun run codebase:contract");
		expect(basicCiWorkflow).toContain("      - run: bun run agentic:check");
		expect(basicCiWorkflow).not.toContain("bun install");
		expect(basicCiWorkflow).not.toContain("bun run build");
		expect(basicCiWorkflow).not.toContain("bun run lint");
		expect(appPackageJson.scripts?.dev).toBe("next dev");
		expect(appPackageJson.scripts?.typecheck).toBe(
			"node scripts/run-next-build-serialized.mjs",
		);
		expect(appScriptBody).not.toContain("scripts/dev-stripe-listen-ready.mjs");
		expect(appScriptBody).not.toContain("CODEX_APP_SERVER");
		expect(appLocalEnvExample).toContain(
			"NEXT_PUBLIC_APP_URL=http://localhost:3000",
		);
		expect(appLocalEnvExample).toContain("CONVEX_WEBHOOK_MUTATION_SECRET=");
		expect(appLocalEnvExample).toContain("STRIPE_PRICE_PRO_MONTHLY=");
		expect(appLocalEnvExample).toContain("NEXT_PUBLIC_POSTHOG_KEY=");
		expect(appLocalEnvExample).not.toContain("APP_BASE_URL=");
		expect(appLocalEnvExample).not.toContain("STRIPE_STARTER_PRICE_ID=");
		expect(appLocalEnvExample).not.toContain(
			"CHECKOUT_FULFILLMENT_RETRY_SECRET=",
		);
		expect(appLocalEnvExample).not.toContain("NEXT_PUBLIC_POSTHOG_TOKEN=");
		expect(appLocalEnvExample).not.toContain(
			"NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com",
		);
		expect(appLocalEnvExample).not.toContain("STRIPE_WORKERS");
		expect(appLocalEnvExample).not.toContain("CODEX_");
		expect(appProductionEnvExample).toContain(
			"NEXT_PUBLIC_APP_URL=https://your-domain.example",
		);
		expect(appProductionEnvExample).toContain("STRIPE_PRICE_PRO_MONTHLY=");
		expect(appProductionEnvExample).not.toContain("APP_BASE_URL=");
		expect(appProductionEnvExample).not.toContain("STRIPE_STARTER_PRICE_ID=");
		expect(appProductionEnvExample).not.toContain("STRIPE_WORKERS");
		expect(appProductionEnvExample).not.toContain("CODEX_");
		expect(productConfigSource).toContain("export const productConfig");
		expect(productConfigSource).toContain("export const productContent");
		expect(productConfigSource).toContain("coreFlow");
		expect(productConfigSource).toContain("generatedProductContent");
		expect(marketingPage).toContain(
			'import { productConfig, productContent } from "@/config/product";',
		);
		expect(marketingPage).not.toContain("@/app/_content");
		expect(appSnapshotText).not.toContain("Northstar");
		expect(appSnapshotText).not.toContain("thienlnam");
		expect(appSnapshotText).not.toContain(
			"next-js-convex-clerk-stripe-template",
		);
		expect(appSnapshotText).not.toContain('action="/api/billing/checkout"');
		expect(appSnapshotText).not.toContain('action="/api/billing/portal"');
		expect(appReadme).toContain("No-Provider Contract");
		expect(appReadme).toContain("config/product.ts");
		expect(appReadme).not.toContain("_content");
		expect(appReadme).not.toContain("api/stripe/webhook");
		expect(templateSourceProvenance).toMatchObject({
			schemaVersion: "generated-starter-template-source-provenance.v1",
			templateId: "starter-app",
			templateVersion: "2026-05-13-sibling-seed",
			materializedOutputRoot: "apps/web",
			generatedOverlaysWin: true,
			contentDigest:
				"sha256-2050b63ecf39c24cfda55f1a3cb93c8d239b94bf701dd8435378be5d2492ee5c",
		});
		expect(
			Object.keys(templateSourceProvenance.provenance ?? {}),
		).not.toContain("originPathHint");
		expect(forbiddenPaths).toEqual([]);
		expectNoForbiddenStarterSnapshotPaths(snapshotPaths);
		expect(snapshotPaths).not.toEqual(
			expect.arrayContaining([
				"apps/web/app/workers/page.tsx",
				"apps/web/app/(protected)/layout.tsx",
				"apps/web/app/(protected)/settings/_components/settings-page.tsx",
				"apps/web/app/blog/page.tsx",
				"apps/web/app/page.tsx",
				"apps/web/app/layout.tsx",
				"apps/web/app/(protected)/workers/setup/page.tsx",
				"apps/web/app/api/workspace/runner/events/route.ts",
				"apps/web/app/api/codex/generate/route.ts",
				"apps/web/src/app/_content/home-page.ts",
				"apps/web/src/app/api/billing/checkout/route.ts",
				"apps/web/convex/workspace.ts",
				"apps/web/platform/codex/app-server.ts",
				"packages/local-runner/src/index.ts",
			]),
		);
	});

	it("materializes an explicit generated operating pack with runnable script wiring", async () => {
		const projectDefinition = createCompleteProjectDefinition();
		const operatingPackPaths = buildOperatingPackPaths(projectDefinition);
		const snapshotFiles = await materializeRepoSnapshot(projectDefinition);
		const packageJson = JSON.parse(
			snapshotText(
				snapshotFiles.find((file) => file.path === "package.json"),
			) || "{}",
		) as {
			scripts?: Record<string, string>;
		};
		const snapshotPaths = new Set(snapshotFiles.map((file) => file.path));
		const program = snapshotText(
			snapshotFiles.find(
				(file) => file.path === operatingPackPaths.activeProgramPath,
			),
		);
		const execPlan = snapshotText(
			snapshotFiles.find(
				(file) => file.path === operatingPackPaths.activeExecPlanPath,
			),
		);
		const startHere = snapshotText(
			snapshotFiles.find((file) => file.path === "START-HERE.md"),
		);

		expect(snapshotPaths.has("scripts/agentic/check-programs.mjs")).toBe(true);
		expect(snapshotPaths.has("scripts/agentic/check-exec-plans.mjs")).toBe(
			true,
		);
		expect(packageJson.scripts?.["programs:lint"]).toBe(
			"bun scripts/agentic/check-programs.mjs",
		);
		expect(packageJson.scripts?.["plans:lint"]).toBe(
			"bun scripts/agentic/check-exec-plans.mjs",
		);
		expect(packageJson.scripts?.["agentic:check"]).toBe(
			"bun run programs:lint && bun run plans:lint",
		);
		for (const scriptCommand of [
			packageJson.scripts?.["codebase:contract"],
			packageJson.scripts?.["programs:lint"],
			packageJson.scripts?.["plans:lint"],
		]) {
			const scriptPath = scriptCommand?.replace(/^bun /, "") ?? "";
			expect(snapshotPaths.has(scriptPath)).toBe(true);
		}

		expect(program).toContain("## Slice Ledger");
		expect(program).toContain(operatingPackPaths.activeExecPlanPath);
		expect(execPlan).toContain("### Test Commands");
		expect(execPlan).toContain(operatingPackPaths.activeProgramPath);
		expect(startHere).toContain("Check the generated operating pack");
		expect(startHere).toContain("bun run agentic:check");
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

	it("keeps generated ExecPlan prompt assets backed by the generated contract", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const snapshotPaths = new Set(snapshotFiles.map((file) => file.path));
		const execPlanPromptFiles = snapshotFiles.filter((file) =>
			file.path.startsWith("docs/prompts/execplan"),
		);

		expect(execPlanPromptFiles.map((file) => file.path).sort()).toEqual([
			"docs/prompts/execplan-execution-loop.md",
			"docs/prompts/execplan-grill.md",
			"docs/prompts/execplan-outline-from-session.md",
			"docs/prompts/execplan-writer.md",
		]);
		expect(snapshotPaths.has("docs/exec-plans/PLANS.md")).toBe(true);
		expect(snapshotPaths.has("docs/prompts/exec-plan-writer.md")).toBe(false);
		for (const promptFile of execPlanPromptFiles) {
			const promptContent = snapshotText(promptFile);

			if (promptContent.includes("docs/exec-plans/PLANS.md")) {
				expect(snapshotPaths.has("docs/exec-plans/PLANS.md")).toBe(true);
			}
		}
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
