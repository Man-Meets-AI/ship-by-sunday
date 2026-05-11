import { describe, expect, it } from "vitest";

import {
	assertReleaseEvidence,
	buildReleaseEvidence,
	proofStateFromStatus,
} from "../../../../scripts/release/lib/release-evidence.mjs";
import { runCli as buildReleaseEvidenceCli } from "../../../../scripts/release/build-release-evidence.mjs";

const manifest = {
	schemaVersion: "release-manifest.v1",
	version: "0.4.0",
	channel: "stable",
	gitTag: "v0.4.0",
	changelogHeading: "## v0.4.0 - Unreleased",
	releaseEvidenceSchemaVersion: "release-evidence.v1",
};

function passedProof(
	url = "https://github.com/parkerrex/ship-by-sunday/actions/runs/1",
) {
	return {
		status: "passed",
		url,
		runId: "1",
		notes: null,
	};
}

describe("release evidence", () => {
	it("builds a valid publishable evidence document", () => {
		const evidence = buildReleaseEvidence({
			manifest,
			tagTargetSha: "main-sha",
			mainSha: "main-sha",
			vercel: passedProof("https://vercel.com/deployments/deployment-id"),
			convex: passedProof(),
			billing: {
				status: "not_required",
				url: null,
				runId: null,
				notes: "Release scope was not billing-sensitive.",
			},
			auth: passedProof(),
			entitlement: passedProof(),
		});

		expect(() =>
			assertReleaseEvidence(evidence, { publish: true }),
		).not.toThrow();
		expect(evidence).toMatchObject({
			schemaVersion: "release-evidence.v1",
			gitTag: "v0.4.0",
			blockers: [],
		});
	});

	it("allows dry-run evidence to record unavailable hosted proof", () => {
		const evidence = buildReleaseEvidence({
			manifest,
			tagTargetSha: "main-sha",
			mainSha: "main-sha",
		});

		expect(() => assertReleaseEvidence(evidence)).not.toThrow();
		expect(evidence.blockers).toContain(
			"Vercel production proof is unavailable.",
		);
		expect(() => assertReleaseEvidence(evidence, { publish: true })).toThrow(
			"release evidence is not publishable",
		);
	});

	it("maps GitHub conclusions into release proof states", () => {
		expect(proofStateFromStatus("success")).toMatchObject({ status: "passed" });
		expect(proofStateFromStatus("not_required")).toMatchObject({
			status: "not_required",
		});
		expect(proofStateFromStatus("skipped")).toMatchObject({
			status: "skipped",
		});
		expect(proofStateFromStatus("failure")).toMatchObject({ status: "failed" });
		expect(proofStateFromStatus(undefined)).toMatchObject({
			status: "unavailable",
		});
	});

	it("uses the explicit tag when workflow dispatch runs on main", async () => {
		const evidence = await buildReleaseEvidenceCli({
			args: [
				"--manifest=../../release.json",
				"--tag=v0.4.0",
				"--tag-target-sha=main-sha",
				"--main-sha=main-sha",
				"--vercel-status=passed",
				"--convex-status=passed",
				"--billing-status=not_required",
				"--auth-status=passed",
				"--entitlement-status=passed",
				"--dry-run",
			],
			env: {
				GITHUB_REF_NAME: "main",
			},
			writeFileImpl: async () => undefined,
			writeStdout: () => undefined,
		});

		expect(evidence.gitTag).toBe("v0.4.0");
		expect(evidence.blockers).toEqual([]);
	});

	it("preserves artifact-derived proof metadata from CLI options", async () => {
		const evidence = await buildReleaseEvidenceCli({
			args: [
				"--manifest=../../release.json",
				"--tag=v0.4.0",
				"--tag-target-sha=main-sha",
				"--main-sha=main-sha",
				"--vercel-status=passed",
				"--vercel-run-id=456",
				"--vercel-url=https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/456",
				"--vercel-notes=Derived from production summary.",
				"--convex-status=not_required",
				"--convex-notes=Not Convex-sensitive.",
				"--billing-status=not_required",
				"--billing-notes=Not billing-sensitive.",
				"--auth-status=passed",
				"--auth-run-id=456",
				"--auth-url=https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/456",
				"--entitlement-status=passed",
				"--entitlement-run-id=456",
				"--entitlement-url=https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/456",
				"--dry-run",
			],
			env: {
				GITHUB_REF_NAME: "main",
			},
			writeFileImpl: async () => undefined,
			writeStdout: () => undefined,
		});

		expect(evidence.vercel).toMatchObject({
			notes: "Derived from production summary.",
			runId: "456",
			status: "passed",
			url: "https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/456",
		});
		expect(evidence.convex).toMatchObject({
			notes: "Not Convex-sensitive.",
			runId: null,
			status: "not_required",
			url: null,
		});
		expect(evidence.blockers).toEqual([]);
	});
});
