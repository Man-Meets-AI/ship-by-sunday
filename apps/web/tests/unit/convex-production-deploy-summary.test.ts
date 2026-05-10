import { describe, expect, it } from "vitest";

import { validateConvexProductionDeploySummary } from "../../../../scripts/release/lib/convex-production-deploy-summary.mjs";
import { runCli as verifyConvexProductionDeploySummaryCli } from "../../../../scripts/release/verify-convex-production-deploy-summary.mjs";

const validSummary = {
	schemaVersion: "release-proof-summary.v1",
	workflowName: "Convex Production Deploy",
	runId: "123",
	runAttempt: "1",
	runUrl: "https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/123",
	commitSha: "main-sha",
	deployMode: "deploy",
	proof: {
		convex: "passed",
	},
	generatedAt: "2026-05-10T00:00:00.000Z",
};

describe("Convex production deploy summary verification", () => {
	it("accepts a same-commit deploy summary", () => {
		expect(
			validateConvexProductionDeploySummary(validSummary, "main-sha"),
		).toEqual({
			ok: true,
			issues: [],
		});
	});

	it("rejects a successful workflow run that only skipped deploy", () => {
		expect(
			validateConvexProductionDeploySummary(
				{
					...validSummary,
					deployMode: "skip",
					proof: {
						convex: "skip",
					},
				},
				"main-sha",
			),
		).toMatchObject({
			ok: false,
			issues: expect.arrayContaining([
				"Convex production deploy mode was skip, expected deploy.",
				"Convex production proof was skip, expected passed.",
			]),
		});
	});

	it("rejects a deploy summary for another commit", () => {
		expect(
			validateConvexProductionDeploySummary(validSummary, "other-sha"),
		).toMatchObject({
			ok: false,
			issues: expect.arrayContaining([
				"Summary commit main-sha does not match other-sha.",
			]),
		});
	});

	it("returns a failing CLI status for non-deploy summaries", async () => {
		let stderr = "";
		const status = await verifyConvexProductionDeploySummaryCli({
			args: ["--summary=summary.json", "--commit=main-sha"],
			readFileImpl: async () =>
				JSON.stringify({
					...validSummary,
					deployMode: "dry-run",
					proof: {
						convex: "dry-run",
					},
				}),
			writeStdout: () => undefined,
			writeStderr: (message) => {
				stderr += message;
			},
		});

		expect(status).toBe(1);
		expect(stderr).toContain(
			"Convex production deploy mode was dry-run, expected deploy.",
		);
	});
});
