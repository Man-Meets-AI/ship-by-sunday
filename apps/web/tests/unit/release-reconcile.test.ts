import { describe, expect, it } from "vitest";

import {
	buildReleaseReconcilePullRequestBody,
	buildReleaseReconcilePullRequestTitle,
	isSnapshotReleasePullRequest,
} from "../../../../scripts/release/lib/release-reconcile.mjs";

describe("release reconcile helpers", () => {
	it("detects merged snapshot release pull requests", () => {
		expect(
			isSnapshotReleasePullRequest({
				base: { ref: "main" },
				head: { ref: "release-snapshot-20260419-141212" },
				merged_at: "2026-04-19T14:16:54Z",
			}),
		).toBe(true);
		expect(
			isSnapshotReleasePullRequest({
				base: { ref: "main" },
				head: { ref: "dev" },
				merged_at: "2026-04-19T14:16:54Z",
			}),
		).toBe(false);
	});

	it("builds the reconcile PR title and body", () => {
		const snapshotReleasePullRequest = {
			head: { ref: "release-snapshot-20260419-141212" },
			html_url: "https://github.com/ParkerRex/ship-by-sunday/pull/101",
			number: 101,
		};

		expect(
			buildReleaseReconcilePullRequestTitle(snapshotReleasePullRequest),
		).toBe("Reconcile main back into dev after snapshot release #101");
		expect(
			buildReleaseReconcilePullRequestBody({
				mainCommitSha: "ee5e0e69b5ed6d04faf77df0fd279b2de53400c7",
				snapshotReleasePullRequest,
			}),
		).toContain(
			"reconcile the merged snapshot release on `main` back into `dev`",
		);
	});
});
