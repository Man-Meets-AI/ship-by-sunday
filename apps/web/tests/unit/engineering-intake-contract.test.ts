import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
	assertEngineeringIntakeSnapshot,
	assertReleaseIntakeFeed,
	assertRuntimeIntakeFeed,
	buildCanonicalNotes,
	buildCanonicalTitle,
	buildReleaseIntakeIdentity,
	buildReleaseIntakeFeed,
	buildRuntimeIntakeFeed,
	buildRuntimeIntakeIdentity,
} from "../../../../scripts/release/lib/engineering-intake-contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");
const fixtureDirectory = path.join(
	repoRoot,
	"scripts",
	"release",
	"fixtures",
	"engineering-intake",
);

function readFixture(name: string) {
	return JSON.parse(
		readFileSync(path.join(fixtureDirectory, name), "utf8"),
	) as Record<string, unknown>;
}

describe("engineering intake contract", () => {
	it("keeps runtime identity stable for the grouped runtime key", () => {
		expect(
			buildRuntimeIntakeIdentity({
				environment: "prod",
				source: "stripe",
				surface: "webhook",
				canonicalPath: "/api/stripe/webhook",
				code: "StripeSignatureVerificationFailed",
			}),
		).toEqual({
			dedupeKey: "sbs:runtime:b7f8f4f893d09d1e",
			externalId: "sbs:runtime:b7f8f4f893d09d1e",
		});
	});

	it("keeps release identity stable for one candidate plus blocker key", () => {
		expect(
			buildReleaseIntakeIdentity({
				candidateRef: "origin/dev",
				candidateSha: "candidate-sha-9f3e2c1a",
				blockerKind: "github_check",
				blockerKey: "release_gate",
			}),
		).toEqual({
			dedupeKey: "sbs:release:7a270a0924140f55",
			externalId: "sbs:release:7a270a0924140f55",
		});
	});

	it("normalizes contract-facing title and notes text", () => {
		expect(buildCanonicalTitle("  Stripe   webhook   blocked ")).toBe(
			"Stripe webhook blocked",
		);
		expect(buildCanonicalNotes(" first line\n\n second line ")).toBe(
			"first line second line",
		);
	});

	it("validates the checked-in runtime and release fixtures", () => {
		expect(() =>
			assertRuntimeIntakeFeed(readFixture("runtime-intake.v1.json")),
		).not.toThrow();
		expect(() =>
			assertReleaseIntakeFeed(readFixture("release-intake.v1.json")),
		).not.toThrow();
	});

	it("keeps the snapshot fixture as a read-only nesting of the authoritative feeds", () => {
		const runtimeFixture = readFixture("runtime-intake.v1.json");
		const releaseFixture = readFixture("release-intake.v1.json");
		const snapshotFixture = readFixture("engineering-intake.snapshot.v1.json");

		expect(() =>
			assertEngineeringIntakeSnapshot(snapshotFixture),
		).not.toThrow();
		expect(snapshotFixture.runtime).toEqual(runtimeFixture);
		expect(snapshotFixture.release).toEqual(releaseFixture);
	});

	it("builds feed envelopes that match the checked-in compatibility contract", () => {
		const runtimeFixture = readFixture("runtime-intake.v1.json");
		const releaseFixture = readFixture("release-intake.v1.json");

		expect(
			buildRuntimeIntakeFeed({
				generatedAt: runtimeFixture.generatedAt as string,
				items: runtimeFixture.items as unknown[],
			}),
		).toEqual(runtimeFixture);

		expect(
			buildReleaseIntakeFeed({
				generatedAt: releaseFixture.generatedAt as string,
				items: releaseFixture.items as unknown[],
			}),
		).toEqual(releaseFixture);
	});
});
