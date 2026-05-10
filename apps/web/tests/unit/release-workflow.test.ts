import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findLatestCompletedRun } from "../../../../scripts/release/collect-hosted-proof-summaries.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");

describe("tag release workflow", () => {
	it("collects hosted proof from summary artifacts instead of check runs", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/release.yml"),
			"utf8",
		);

		expect(workflow).toContain(
			"node scripts/release/collect-hosted-proof-summaries.mjs",
		);
		expect(workflow).toContain("actions: read");
		expect(workflow).not.toContain("commits/${TAG_TARGET_SHA}/check-runs");
		expect(workflow).not.toContain("check-runs.json");
	});

	it("passes artifact-derived run metadata into release evidence", () => {
		const workflow = readFileSync(
			path.join(repoRoot, ".github/workflows/release.yml"),
			"utf8",
		);

		expect(workflow).toContain('--vercel-run-id="$VERCEL_RUN_ID"');
		expect(workflow).toContain('--vercel-url="$VERCEL_URL"');
		expect(workflow).toContain('--billing-notes="$BILLING_NOTES"');
		expect(workflow).toContain('--convex-run-id="$CONVEX_RUN_ID"');
	});

	it("can use a same-commit manual production proof summary when it is the newest completed proof", () => {
		const requestedEvents: string[] = [];
		const run = findLatestCompletedRun({
			commitSha: "main-sha",
			events: ["push", "workflow_dispatch"],
			repo: "Man-Meets-AI/ship-by-sunday",
			runGhImpl: (args: string[]) => {
				const event = args[args.indexOf("--event") + 1];
				requestedEvents.push(event);

				return JSON.stringify(
					event === "push"
						? [
								{
									databaseId: 100,
									headSha: "main-sha",
									status: "completed",
								},
							]
						: [
								{
									databaseId: 200,
									headSha: "main-sha",
									status: "completed",
								},
							],
				);
			},
			workflow: "production-release-proof.yml",
		});

		expect(requestedEvents).toEqual(["push", "workflow_dispatch"]);
		expect(run).toMatchObject({
			databaseId: 200,
			event: "workflow_dispatch",
		});
	});

	it("fails closed instead of using stale evidence when the newest same-commit proof rerun is still active", () => {
		expect(() =>
			findLatestCompletedRun({
				commitSha: "main-sha",
				events: ["push", "workflow_dispatch"],
				repo: "Man-Meets-AI/ship-by-sunday",
				runGhImpl: (args: string[]) => {
					const event = args[args.indexOf("--event") + 1];

					return JSON.stringify(
						event === "push"
							? [
									{
										databaseId: 200,
										headSha: "main-sha",
										status: "completed",
									},
								]
							: [
									{
										databaseId: 300,
										headSha: "main-sha",
										status: "in_progress",
									},
								],
					);
				},
				workflow: "production-release-proof.yml",
			}),
		).toThrow(
			"production-release-proof.yml run 300 for commit main-sha is in_progress, expected completed.",
		);
	});
});
