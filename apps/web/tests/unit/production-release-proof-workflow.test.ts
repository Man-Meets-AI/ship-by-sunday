import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");

describe("production release proof workflow", () => {
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
});
