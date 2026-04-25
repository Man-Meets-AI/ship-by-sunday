import { describe, expect, it } from "vitest";

import { assertEngineeringIntakeSnapshot } from "../../../../scripts/release/lib/engineering-intake-contract.mjs";
import { runCli } from "../../../../scripts/release/export-engineering-intake-snapshot.mjs";

describe("engineering intake snapshot", () => {
	it("nests runtime and release documents without changing them", async () => {
		const runtimeDocument = {
			schemaVersion: "runtime-intake.v1",
			generatedAt: "2026-04-19T15:00:00.000Z",
			sourceSystem: "ship_by_sunday",
			sourceRepository: "ship-by-sunday",
			compatibility: {
				policy:
					"Within v1, additive optional fields are allowed. Any field removal, rename, or semantic redefinition must ship as v2.",
			},
			ownership: {
				sourceOfTruth: "ship-by-sunday observability incidents",
				lifecycleOwner: "ship-by-sunday observability incidents",
				ackOwner: "ship-by-sunday observability incident status route",
				resolveOwner: "ship-by-sunday observability incident status route",
				notes: "runtime ownership",
			},
			items: [],
		};

		const releaseDocument = {
			schemaVersion: "release-intake.v1",
			generatedAt: "2026-04-19T15:00:00.000Z",
			sourceSystem: "ship_by_sunday",
			sourceRepository: "ship-by-sunday",
			compatibility: {
				policy:
					"Within v1, additive optional fields are allowed. Any field removal, rename, or semantic redefinition must ship as v2.",
			},
			ownership: {
				sourceOfTruth: "ship-by-sunday release triage",
				lifecycleOwner: "ship-by-sunday release triage summary",
				ackOwner: null,
				resolveOwner:
					"ship-by-sunday release candidate, proof checks, and deployment metadata",
				notes: "release ownership",
			},
			items: [],
		};

		const result = await runCli({
			runRuntimeCli: async () => ({ document: runtimeDocument }),
			runReleaseCli: async () => ({ document: releaseDocument }),
		});

		expect(() =>
			assertEngineeringIntakeSnapshot(result.document),
		).not.toThrow();
		expect(result.document.runtime).toEqual(runtimeDocument);
		expect(result.document.release).toEqual(releaseDocument);
	});
});
