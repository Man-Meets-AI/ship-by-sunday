import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");

describe("release proof workflows", () => {
	it("waits for the production alias on the matching Vercel deployment", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/production-release-proof.yml"),
			"utf8",
		);

		const aliasWaitCount =
			workflow.match(/--alias_domain=www\.man-meets-ai\.com/g)?.length ?? 0;

		expect(aliasWaitCount).toBe(2);
	});

	it("runs Stripe webhook endpoint preflight before production billing proof", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/production-release-proof.yml"),
			"utf8",
		);

		expect(workflow).toContain(
			"Verify production Stripe environment and checkout route",
		);
		expect(workflow).toContain("--require-webhook-endpoint");
		expect(workflow).toContain("--expected-mode=live");
	});

	it("requires Convex-sensitive proof to verify an actual deploy summary", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/production-release-proof.yml"),
			"utf8",
		);

		expect(workflow).toContain('gh run download "$convex_run_id"');
		expect(workflow).toContain(
			"node scripts/release/verify-convex-production-deploy-summary.mjs",
		);
		expect(workflow).toContain(
			'--summary="$convex_summary_dir/convex-production-deploy-summary.json"',
		);
		expect(workflow).toContain('--commit="$RELEASE_COMMIT_SHA"');
	});

	it("requires manual proof runs to provide an explicit release-scope base", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/production-release-proof.yml"),
			"utf8",
		);

		expect(workflow).toContain("base_sha:");
		expect(workflow).toContain("MANUAL_BASE_SHA: ${{ inputs.base_sha }}");
		expect(workflow).toContain(
			"Manual production release proof requires inputs.base_sha",
		);
		expect(workflow).toContain(
			'git merge-base --is-ancestor "$base_sha" "$head_sha"',
		);
		expect(workflow).not.toContain('git rev-parse "${head_sha}^"');
	});

	it("passes the selected billing offer through production billing proof and evidence", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/production-release-proof.yml"),
			"utf8",
		);

		expect(workflow).toContain("billing_offer:");
		expect(workflow).toContain(
			"MANUAL_BILLING_OFFER: ${{ inputs.billing_offer }}",
		);
		expect(workflow).toContain(
			"BILLING_PROOF_OFFER: ${{ needs.release_scope.outputs.billing_offer }}",
		);
		expect(workflow).toContain(
			'bun run release:proof -- --proof=billing_integration --offer="$BILLING_PROOF_OFFER"',
		);
		expect(workflow).toContain("billingProofOfferId:");
	});

	it("runs Stripe webhook endpoint preflight before dev staging card proof", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/dev-staging-payment-proof.yml"),
			"utf8",
		);

		expect(workflow).toContain(
			"Verify dev Stripe environment and webhook endpoint",
		);
		expect(workflow.indexOf("--require-webhook-endpoint")).toBeGreaterThan(-1);
		expect(
			workflow.indexOf("Run dev Stripe card payment proof"),
		).toBeGreaterThan(workflow.indexOf("--require-webhook-endpoint"));
		expect(workflow).toContain("--expected-mode=test");
	});
});
