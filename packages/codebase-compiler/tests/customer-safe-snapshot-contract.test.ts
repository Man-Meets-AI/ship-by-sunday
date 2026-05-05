import {
	CUSTOMER_SAFE_SNAPSHOT_BASELINE,
	CUSTOMER_SAFE_SNAPSHOT_CONTRACT,
	CUSTOMER_SAFE_SNAPSHOT_REQUIRED_REPLACEMENTS,
} from "../src/repo-generation/customer-safe-snapshot-contract";
import {
	buildRepoDownloadTraceIncludes,
	isExcludedSnapshotPath,
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

	it("keeps the shared trace contract aligned with the shipped source files", () => {
		expect(buildRepoDownloadTraceIncludes()).toEqual(
			expect.arrayContaining([
				"../../docs/prompts/execplan*.md",
				"./.env.local.example",
				"./tests/**/*",
			]),
		);
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
