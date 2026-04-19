import { describe, expect, it } from "vitest";

import {
	buildReleaseSnapshotBranchName,
	buildReleaseSnapshotPlan,
	evaluateReleaseSnapshotEligibility,
} from "../../../../qa/scripts/lib/release-snapshot.mjs";

describe("release snapshot helpers", () => {
	it("builds a deterministic snapshot branch name", () => {
		expect(
			buildReleaseSnapshotBranchName(new Date("2026-04-19T05:01:02.000Z")),
		).toBe("release-snapshot-20260419-050102");
	});

	it("allows snapshot mode only when the release PR is structurally blocked", () => {
		expect(
			evaluateReleaseSnapshotEligibility({
				baseBranchName: "main",
				candidateSha: "candidate-sha",
				headBranchName: "dev",
				releasePullRequest: {
					baseRefName: "main",
					headRefName: "dev",
					headRefOid: "candidate-sha",
					mergeStateStatus: "DIRTY",
					mergeable: "CONFLICTING",
					number: 83,
				},
			}),
		).toEqual({
			allowed: true,
			blockers: [],
		});
	});

	it("forbids snapshot mode when the normal release path is still mergeable", () => {
		const eligibility = evaluateReleaseSnapshotEligibility({
			baseBranchName: "main",
			candidateSha: "candidate-sha",
			headBranchName: "dev",
			releasePullRequest: {
				baseRefName: "main",
				headRefName: "dev",
				headRefOid: "candidate-sha",
				mergeStateStatus: "BEHIND",
				mergeable: "MERGEABLE",
				number: 83,
			},
		});

		expect(eligibility.allowed).toBe(false);
		expect(eligibility.blockers).toContain(
			"Snapshot release is forbidden because release PR #83 is not structurally blocked (mergeable=MERGEABLE, mergeStateStatus=BEHIND).",
		);
	});

	it("builds the snapshot plan with tree identity and rollback commands", () => {
		expect(
			buildReleaseSnapshotPlan({
				branchName: "release-snapshot-20260419-050102",
				candidateSha: "candidate-sha",
				candidateTreeSha: "candidate-tree",
				mainSha: "main-sha",
			}),
		).toEqual({
			branchName: "release-snapshot-20260419-050102",
			candidateSha: "candidate-sha",
			candidateTreeSha: "candidate-tree",
			commitMessage: "chore: release snapshot candidate-sh",
			createCommands: [
				"git commit-tree candidate-tree -p main-sha",
				"git branch release-snapshot-20260419-050102 <snapshot-commit>",
			],
			postMergeCleanupCommands: [
				"git branch -D release-snapshot-20260419-050102",
				"git push origin :release-snapshot-20260419-050102",
			],
			prBaseBranch: "main",
			rollbackCommands: [
				"git branch -D release-snapshot-20260419-050102",
				"git push origin :release-snapshot-20260419-050102",
			],
			treeIdentityCommand:
				"git diff --quiet candidate-sha release-snapshot-20260419-050102",
		});
	});
});
