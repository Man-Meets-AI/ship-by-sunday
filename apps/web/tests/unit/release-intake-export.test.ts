import { describe, expect, it } from "vitest";

import { assertReleaseIntakeFeed } from "../../../../scripts/release/lib/engineering-intake-contract.mjs";
import { buildReleaseIntakeExport } from "../../../../scripts/release/lib/release-intake-export.mjs";

function buildSummary(overrides = {}) {
	return {
		candidate: {
			aheadCount: 10,
			baseRef: "origin/main",
			baseSha: "base-sha",
			behindCount: 0,
			changedFiles: undefined,
			mergeBaseSha: "merge-base-sha",
			ref: "origin/dev",
			sha: "candidate-sha",
		},
		proof: {
			aliasDomain: "dev.man-meets-ai.com",
			billingGitHubEnvironmentName: "dev-staging-billing-integration",
			blockers: ["GitHub check run 'release_gate' concluded with failure."],
			deployment: {
				aliases: ["dev.man-meets-ai.com"],
				aliasBound: true,
				expectedAlias: "dev.man-meets-ai.com",
				projectId: "project-id",
				resolved: true,
				target: "preview",
				teamId: "team-id",
				uid: "deployment-id",
				url: "https://dev-commit.vercel.app",
			},
			githubEnvironmentName: "dev-staging",
			latestCheckRunsByName: {
				release_gate: {
					conclusion: "failure",
					details_url:
						"https://github.com/parkerrex/ship-by-sunday/actions/runs/123",
					html_url: null,
					id: 123,
					name: "release_gate",
					status: "completed",
				},
			},
			qaEnvFile: "apps/web/.env.local",
			ready: false,
			requiredChecks: ["release_scope", "default_ship", "release_gate"],
			vercelEnvironment: "preview",
		},
		readiness: {
			blockers: ["GitHub check run 'release_gate' concluded with failure."],
			ready: false,
		},
		releasePath: {
			blockers: [],
			ready: true,
			snapshotRequired: false,
			state: "releasable",
		},
		releasePullRequest: {
			number: 83,
			url: "https://github.com/parkerrex/ship-by-sunday/pull/83",
		},
		releaseScope: {
			billingSensitive: false,
		},
		...overrides,
	};
}

describe("release intake export", () => {
	it("builds a release blocker item from a failing GitHub check", () => {
		const document = buildReleaseIntakeExport({
			generatedAt: "2026-04-19T15:00:00.000Z",
			summary: buildSummary(),
		});

		expect(() => assertReleaseIntakeFeed(document)).not.toThrow();
		expect(document.items).toHaveLength(1);
		expect(document.items[0]).toMatchObject({
			blockerKind: "github_check",
			blockerKey: "release_gate",
			status: "active",
			candidate: {
				ref: "origin/dev",
				sha: "candidate-sha",
			},
		});
		expect(document.items[0].sourceContext.sourceRecordRefs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: "github_pr",
					value: "83",
				}),
				expect.objectContaining({
					kind: "github_check",
					value: "release_gate",
				}),
			]),
		);
	});

	it("marks metadata blockers as blocked_metadata and preserves release-path state", () => {
		const document = buildReleaseIntakeExport({
			generatedAt: "2026-04-19T15:00:00.000Z",
			summary: buildSummary({
				proof: {
					aliasDomain: "dev.man-meets-ai.com",
					blockers: [],
					deployment: {
						expectedAlias: "dev.man-meets-ai.com",
						projectId: null,
						resolved: false,
						target: "preview",
						teamId: null,
					},
					latestCheckRunsByName: {},
					ready: false,
					requiredChecks: ["release_scope", "default_ship", "release_gate"],
				},
				readiness: {
					blockers: [
						"Vercel deployment metadata unavailable: missing VERCEL_TOKEN or --vercel-token.",
					],
					ready: false,
				},
				releasePath: {
					blockers: [
						"Vercel deployment metadata unavailable: missing VERCEL_TOKEN or --vercel-token.",
					],
					ready: false,
					snapshotRequired: true,
					state: "blocked_metadata",
				},
			}),
		});

		expect(document.items).toHaveLength(1);
		expect(document.items[0]).toMatchObject({
			blockerKind: "metadata",
			status: "blocked_metadata",
			releaseState: {
				pathState: "blocked_metadata",
				snapshotRequired: true,
			},
		});
	});
});
