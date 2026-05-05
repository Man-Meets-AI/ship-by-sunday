import {
	CUSTOMER_SAFE_SNAPSHOT_BASELINE,
	CUSTOMER_SAFE_SNAPSHOT_CONTRACT,
	CUSTOMER_SAFE_SNAPSHOT_REQUIRED_REPLACEMENTS,
} from "../src/repo-generation/customer-safe-snapshot-contract";
import { buildRepoDownloadTraceIncludes } from "../src/repo-generation/repo-download-source-contract";

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
});
