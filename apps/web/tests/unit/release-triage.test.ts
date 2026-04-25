import { describe, expect, it } from "vitest";

import {
	buildReleaseTriageSummary,
	selectLatestCheckRuns,
} from "../../../../scripts/release/lib/release-triage.mjs";

describe("release triage helpers", () => {
	it("keeps the newest check run for each name", () => {
		const latestCheckRunsByName = selectLatestCheckRuns([
			{
				completed_at: "2026-04-18T15:26:31Z",
				conclusion: "failure",
				id: 1,
				name: "release_gate",
				status: "completed",
			},
			{
				completed_at: "2026-04-18T15:31:35Z",
				conclusion: "success",
				id: 2,
				name: "release_gate",
				status: "completed",
			},
		]);

		expect(latestCheckRunsByName.release_gate?.conclusion).toBe("success");
	});

	it("marks the candidate releasable when metadata and proof align", () => {
		const summary = buildReleaseTriageSummary({
			baseBranchName: "main",
			candidate: {
				aheadCount: 10,
				baseRef: "origin/main",
				baseSha: "base-sha",
				behindCount: 0,
				changedFiles: ["apps/web/app/api/stripe/checkout/route.ts"],
				mergeBaseSha: "merge-base-sha",
				ref: "origin/dev",
				sha: "candidate-sha",
			},
			checkRuns: [
				{
					completed_at: "2026-04-18T15:26:45Z",
					conclusion: "success",
					id: 1,
					name: "release_scope",
					status: "completed",
				},
				{
					completed_at: "2026-04-18T15:29:27Z",
					conclusion: "success",
					id: 2,
					name: "default_ship",
					status: "completed",
				},
				{
					completed_at: "2026-04-18T15:31:29Z",
					conclusion: "success",
					id: 3,
					name: "billing_integration",
					status: "completed",
				},
				{
					completed_at: "2026-04-18T15:31:35Z",
					conclusion: "success",
					id: 4,
					name: "release_gate",
					status: "completed",
				},
			],
			deployment: {
				aliasBound: true,
				aliases: ["dev.man-meets-ai.com"],
				expectedAlias: "dev.man-meets-ai.com",
				projectId: "project-id",
				resolved: true,
				target: "preview",
				teamId: "team-id",
				uid: "deployment-id",
				url: "https://dev-commit.vercel.app",
			},
			headBranchName: "dev",
			metadataFailures: [],
			proofEnvironment: {
				aliasDomain: "dev.man-meets-ai.com",
				billingGitHubEnvironmentName: "dev-staging-billing-integration",
				githubEnvironmentName: "dev-staging",
				qaEnvFile: "apps/web/.env.local",
				vercelEnvironment: "preview",
			},
			releasePullRequest: {
				baseRefName: "main",
				headRefName: "dev",
				headRefOid: "candidate-sha",
				mergeStateStatus: "BEHIND",
				mergeable: "MERGEABLE",
				number: 83,
			},
			releaseScope: {
				baseRef: "merge-base-sha",
				billingSensitive: true,
				billingSensitiveFiles: ["apps/web/app/api/stripe/checkout/route.ts"],
				changedFiles: ["apps/web/app/api/stripe/checkout/route.ts"],
				convexSensitive: false,
				convexSensitiveFiles: [],
				headRef: "origin/dev",
			},
		});

		expect(summary.releasePath.state).toBe("releasable");
		expect(summary.readiness.ready).toBe(true);
		expect(summary.proof.requiredChecks).toContain("billing_integration");
	});

	it("blocks when release metadata is missing", () => {
		const summary = buildReleaseTriageSummary({
			baseBranchName: "main",
			candidate: {
				aheadCount: 10,
				baseRef: "origin/main",
				baseSha: "base-sha",
				behindCount: 0,
				changedFiles: [],
				mergeBaseSha: "merge-base-sha",
				ref: "origin/dev",
				sha: "candidate-sha",
			},
			checkRuns: [],
			deployment: {
				expectedAlias: "dev.man-meets-ai.com",
				projectId: null,
				resolved: false,
				target: "preview",
				teamId: null,
			},
			headBranchName: "dev",
			metadataFailures: [
				"Vercel deployment metadata unavailable: missing VERCEL_TOKEN.",
			],
			proofEnvironment: {
				aliasDomain: "dev.man-meets-ai.com",
				billingGitHubEnvironmentName: "dev-staging-billing-integration",
				githubEnvironmentName: "dev-staging",
				qaEnvFile: "apps/web/.env.local",
				vercelEnvironment: "preview",
			},
			releasePullRequest: null,
			releaseScope: {
				baseRef: "merge-base-sha",
				billingSensitive: false,
				billingSensitiveFiles: [],
				changedFiles: [],
				convexSensitive: false,
				convexSensitiveFiles: [],
				headRef: "origin/dev",
			},
		});

		expect(summary.releasePath.state).toBe("blocked_metadata");
		expect(summary.readiness.ready).toBe(false);
	});

	it("blocks when the release PR does not match origin/dev", () => {
		const summary = buildReleaseTriageSummary({
			baseBranchName: "main",
			candidate: {
				aheadCount: 10,
				baseRef: "origin/main",
				baseSha: "base-sha",
				behindCount: 0,
				changedFiles: [],
				mergeBaseSha: "merge-base-sha",
				ref: "origin/dev",
				sha: "candidate-sha",
			},
			checkRuns: [],
			deployment: {
				aliasBound: true,
				aliases: ["dev.man-meets-ai.com"],
				expectedAlias: "dev.man-meets-ai.com",
				projectId: "project-id",
				resolved: true,
				target: "preview",
				teamId: "team-id",
				uid: "deployment-id",
				url: "https://dev-commit.vercel.app",
			},
			headBranchName: "dev",
			metadataFailures: [],
			proofEnvironment: {
				aliasDomain: "dev.man-meets-ai.com",
				billingGitHubEnvironmentName: "dev-staging-billing-integration",
				githubEnvironmentName: "dev-staging",
				qaEnvFile: "apps/web/.env.local",
				vercelEnvironment: "preview",
			},
			releasePullRequest: {
				baseRefName: "main",
				headRefName: "dev",
				headRefOid: "old-candidate-sha",
				mergeStateStatus: "BEHIND",
				mergeable: "MERGEABLE",
				number: 83,
			},
			releaseScope: {
				baseRef: "merge-base-sha",
				billingSensitive: false,
				billingSensitiveFiles: [],
				changedFiles: [],
				convexSensitive: false,
				convexSensitiveFiles: [],
				headRef: "origin/dev",
			},
		});

		expect(summary.releasePath.state).toBe("blocked_unrelated_dev_scope");
		expect(summary.readiness.ready).toBe(false);
	});

	it("requires snapshot mode when the release PR is conflicting", () => {
		const summary = buildReleaseTriageSummary({
			baseBranchName: "main",
			candidate: {
				aheadCount: 10,
				baseRef: "origin/main",
				baseSha: "base-sha",
				behindCount: 0,
				changedFiles: [],
				mergeBaseSha: "merge-base-sha",
				ref: "origin/dev",
				sha: "candidate-sha",
			},
			checkRuns: [],
			deployment: {
				aliasBound: true,
				aliases: ["dev.man-meets-ai.com"],
				expectedAlias: "dev.man-meets-ai.com",
				projectId: "project-id",
				resolved: true,
				target: "preview",
				teamId: "team-id",
				uid: "deployment-id",
				url: "https://dev-commit.vercel.app",
			},
			headBranchName: "dev",
			metadataFailures: [],
			proofEnvironment: {
				aliasDomain: "dev.man-meets-ai.com",
				billingGitHubEnvironmentName: "dev-staging-billing-integration",
				githubEnvironmentName: "dev-staging",
				qaEnvFile: "apps/web/.env.local",
				vercelEnvironment: "preview",
			},
			releasePullRequest: {
				baseRefName: "main",
				headRefName: "dev",
				headRefOid: "candidate-sha",
				mergeStateStatus: "DIRTY",
				mergeable: "CONFLICTING",
				number: 83,
			},
			releaseScope: {
				baseRef: "merge-base-sha",
				billingSensitive: false,
				billingSensitiveFiles: [],
				changedFiles: [],
				convexSensitive: false,
				convexSensitiveFiles: [],
				headRef: "origin/dev",
			},
		});

		expect(summary.releasePath.state).toBe("snapshot_required");
		expect(summary.releasePath.snapshotRequired).toBe(true);
	});
});
