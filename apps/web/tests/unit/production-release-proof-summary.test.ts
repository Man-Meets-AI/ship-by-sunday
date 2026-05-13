import { describe, expect, it } from "vitest";

import {
	buildProofStatesFromProductionReleaseProofSummary,
	validateProductionReleaseProofSummary,
} from "../../../../scripts/release/lib/production-release-proof-summary.mjs";

const validSummary = {
	schemaVersion: "release-proof-summary.v1",
	workflowName: "Production Release Proof",
	runId: "456",
	runAttempt: "1",
	runUrl: "https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/456",
	commitSha: "main-sha",
	baseSha: "base-sha",
	environment: "production",
	proof: {
		billingSensitive: true,
		convexSensitive: true,
		defaultShip: "success",
		billingIntegration: "success",
		billingProofOfferId: "workers",
	},
	generatedAt: "2026-05-10T00:00:00.000Z",
};

describe("Production release proof summary verification", () => {
	it("accepts a same-commit successful production proof summary", () => {
		expect(
			validateProductionReleaseProofSummary(validSummary, "main-sha"),
		).toEqual({
			ok: true,
			issues: [],
		});
	});

	it("derives proof states from a successful production summary", () => {
		expect(
			buildProofStatesFromProductionReleaseProofSummary(
				validSummary,
				"main-sha",
			),
		).toMatchObject({
			ok: true,
			proof: {
				auth: {
					runId: "456",
					status: "passed",
					url: validSummary.runUrl,
				},
				billing: {
					notes:
						"Production proof classified the release as billing-sensitive and billing_integration passed for workers.",
					runId: "456",
					status: "passed",
					url: validSummary.runUrl,
				},
				convexSensitive: true,
				entitlement: {
					runId: "456",
					status: "passed",
					url: validSummary.runUrl,
				},
				vercel: {
					runId: "456",
					status: "passed",
					url: validSummary.runUrl,
				},
			},
		});
	});

	it("derives billing as not required only from a non-sensitive skipped summary", () => {
		expect(
			buildProofStatesFromProductionReleaseProofSummary(
				{
					...validSummary,
					proof: {
						...validSummary.proof,
						billingSensitive: false,
						billingIntegration: "skipped",
						billingProofOfferId: null,
					},
				},
				"main-sha",
			),
		).toMatchObject({
			ok: true,
			proof: {
				billing: {
					status: "not_required",
				},
			},
		});
	});

	it("marks skipped billing as failed when production proof says billing was sensitive", () => {
		expect(
			buildProofStatesFromProductionReleaseProofSummary(
				{
					...validSummary,
					proof: {
						...validSummary.proof,
						billingSensitive: true,
						billingIntegration: "skipped",
						billingProofOfferId: null,
					},
				},
				"main-sha",
			),
		).toMatchObject({
			ok: true,
			proof: {
				billing: {
					status: "failed",
				},
			},
		});
	});

	it("rejects a production summary for another commit", () => {
		expect(
			buildProofStatesFromProductionReleaseProofSummary(
				validSummary,
				"other-sha",
			),
		).toMatchObject({
			ok: false,
			issues: expect.arrayContaining([
				"Summary commit main-sha does not match other-sha.",
			]),
		});
	});

	it("rejects successful billing proof summaries that omit the selected offer", () => {
		expect(
			validateProductionReleaseProofSummary(
				{
					...validSummary,
					proof: {
						...validSummary.proof,
						billingProofOfferId: null,
					},
				},
				"main-sha",
			),
		).toMatchObject({
			ok: false,
			issues: expect.arrayContaining([
				"Production release proof summary proof.billingProofOfferId must be one of starter, workers when billingIntegration is success.",
			]),
		});
	});
});
