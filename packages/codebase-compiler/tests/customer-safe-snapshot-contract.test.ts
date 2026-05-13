import {
	CUSTOMER_SAFE_SNAPSHOT_BASELINE,
	CUSTOMER_SAFE_SNAPSHOT_CONTRACT,
	CUSTOMER_SAFE_SNAPSHOT_REQUIRED_REPLACEMENTS,
} from "../src/repo-generation/customer-safe-snapshot-contract";
import {
	buildRepoDownloadTraceIncludes,
	isExcludedSnapshotPath,
	starterSnapshotForbiddenFilePaths,
	starterSnapshotForbiddenPathPrefixes,
} from "../src/repo-generation/repo-download-source-contract";

describe("customer-safe snapshot contract", () => {
	it("starts from the tracked repo baseline and captures the frozen grill decisions", () => {
		expect(CUSTOMER_SAFE_SNAPSHOT_BASELINE).toBe("full-tracked-repo");
		expect(CUSTOMER_SAFE_SNAPSHOT_REQUIRED_REPLACEMENTS).toEqual(
			expect.arrayContaining(["apps/web/.env.production.example"]),
		);
		expect(CUSTOMER_SAFE_SNAPSHOT_CONTRACT).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					pathPattern: "docs/prompts/execplan*.md",
					shippingMode: "ship-unchanged",
				}),
				expect.objectContaining({
					pathPattern: "docs/prompts/program-*.md",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "docs/PLANS.md",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "docs/exec-plans/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "docs/programs/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: ".plans/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: ".agents/**",
					shippingMode: "ship-generalized",
				}),
				expect.objectContaining({
					pathPattern: "docs/testing/**",
					shippingMode: "ship-generalized",
				}),
				expect.objectContaining({
					pathPattern: ".github/workflows/**",
					shippingMode: "ship-generalized",
				}),
				expect.objectContaining({
					pathPattern: "docs/programs/PROGRAMS.md",
					shippingMode: "ship-generalized",
				}),
				expect.objectContaining({
					pathPattern: "docs/exec-plans/PLANS.md",
					shippingMode: "ship-generalized",
				}),
				expect.objectContaining({
					pathPattern: "docs/openai/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "docs/ship-by-sunday/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: ".codex/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/.env.production",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/app/workers/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/app/(protected)/workers/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern:
						"apps/web/app/(protected)/_components/existing-codebase-doctor-pass/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern:
						"apps/web/app/(protected)/_components/existing-codebase-findings/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern:
						"apps/web/app/(protected)/_components/existing-codebase-support/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/app/(protected)/_lib/workspace-*",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/app/api/workspace/runner/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/app/api/codex/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/convex/workspace.ts",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/convex/workspace/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "apps/web/platform/codex/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "packages/local-runner/**",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "tmp-blog-article.png",
					shippingMode: "exclude",
				}),
				expect.objectContaining({
					pathPattern: "tmp-blog-article-mobile.png",
					shippingMode: "exclude",
				}),
			]),
		);
	});

	it("excludes Worker, runner, and Codex bridge paths from generated Starter snapshots", () => {
		const representativeForbiddenPaths = [
			"apps/web/app/workers/page.tsx",
			"apps/web/app/(protected)/workers/setup/page.tsx",
			"apps/web/app/(protected)/_components/existing-codebase-setup/setup-package-runner-command.tsx",
			"apps/web/app/(protected)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx",
			"apps/web/app/(protected)/_components/existing-codebase-findings/workspace-findings-page.tsx",
			"apps/web/app/(protected)/_components/existing-codebase-support/workspace-loops-catalog.tsx",
			"apps/web/app/(protected)/_components/codex-connection-card/codex-connection-card.tsx",
			"apps/web/app/(protected)/_lib/workspace-setup-readiness-model.ts",
			"apps/web/app/api/workspace/runner/events/route.ts",
			"apps/web/app/api/codex/generate/route.ts",
			"apps/web/convex/workspace.ts",
			"apps/web/convex/workspace/model.ts",
			"apps/web/platform/codex/app-server.ts",
			"packages/local-runner/src/index.ts",
		];

		expect(starterSnapshotForbiddenPathPrefixes).toEqual(
			expect.arrayContaining([
				"apps/web/app/workers/",
				"apps/web/app/(protected)/workers/",
				"apps/web/app/api/workspace/runner/",
				"apps/web/app/api/codex/",
				"apps/web/app/(protected)/_components/existing-codebase-doctor-pass/",
				"apps/web/app/(protected)/_components/existing-codebase-findings/",
				"apps/web/app/(protected)/_components/existing-codebase-support/",
				"apps/web/convex/workspace/",
				"apps/web/platform/codex/",
				"packages/local-runner/",
			]),
		);
		expect(starterSnapshotForbiddenFilePaths).toEqual(
			expect.arrayContaining([
				"apps/web/app/(protected)/_lib/workspace-setup-readiness-model.ts",
				"apps/web/convex/workspace.ts",
			]),
		);
		for (const forbiddenPath of representativeForbiddenPaths) {
			expect(isExcludedSnapshotPath(forbiddenPath)).toBe(true);
		}
	});

	it("keeps the shared trace contract aligned with the shipped source files", () => {
		expect(buildRepoDownloadTraceIncludes()).toEqual(
			expect.arrayContaining([
				"../../docs/prompts/execplan*.md",
				"./.env.local.example",
			]),
		);
		expect(buildRepoDownloadTraceIncludes()).not.toContain("./tests/**/*");
		expect(buildRepoDownloadTraceIncludes()).not.toContain(
			"../../docs/prompts/exec-plan*.md",
		);
		expect(buildRepoDownloadTraceIncludes()).not.toContain("./.env.production");
		expect(buildRepoDownloadTraceIncludes()).not.toContain(
			"../../docs/PLANS.md",
		);
		expect(buildRepoDownloadTraceIncludes()).not.toContain(
			"../../docs/exec-plans/PLANS.md",
		);
	});

	it("keeps internal Program and ExecPlan source archives out of tracing", () => {
		const tracedPaths = buildRepoDownloadTraceIncludes();

		expect(
			tracedPaths.some((path) => path.includes("../../docs/programs/")),
		).toBe(false);
		expect(
			tracedPaths.some((path) => path.includes("../../docs/exec-plans/")),
		).toBe(false);
	});

	it("requires explicit generated-path allowance for Program and ExecPlan files", () => {
		const generatedExecPlanContract = "docs/exec-plans/PLANS.md";
		const generatedProgramContract = "docs/programs/PROGRAMS.md";
		const allowedGeneratedPaths = new Set([
			generatedExecPlanContract,
			generatedProgramContract,
		]);

		expect(isExcludedSnapshotPath(generatedExecPlanContract)).toBe(true);
		expect(isExcludedSnapshotPath(generatedProgramContract)).toBe(true);
		expect(
			isExcludedSnapshotPath(generatedExecPlanContract, allowedGeneratedPaths),
		).toBe(false);
		expect(
			isExcludedSnapshotPath(generatedProgramContract, allowedGeneratedPaths),
		).toBe(false);
		expect(
			isExcludedSnapshotPath(
				"docs/exec-plans/completed/2026-05-02-internal-plan.md",
				allowedGeneratedPaths,
			),
		).toBe(true);
		expect(
			isExcludedSnapshotPath(
				"docs/programs/active/2026-05-02-internal-program/program.md",
				allowedGeneratedPaths,
			),
		).toBe(true);
	});
});
