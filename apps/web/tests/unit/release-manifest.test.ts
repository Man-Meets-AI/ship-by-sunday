import { describe, expect, it } from "vitest";

import {
	assertReleaseManifest,
	parseReleaseManifest,
	parseReleaseTag,
} from "../../../../scripts/release/lib/release-manifest.mjs";

const changelogSource = [
	"# Changelog",
	"",
	"## 2026-04-19",
	"",
	"### Changed",
	"",
	"- Release workflow work.",
].join("\n");

function buildManifest(overrides = {}) {
	return {
		schemaVersion: "release-manifest.v1",
		version: "0.3.0",
		channel: "stable",
		gitTag: "v0.3.0",
		changelogHeading: "## 2026-04-19",
		releaseEvidenceSchemaVersion: "release-evidence.v1",
		...overrides,
	};
}

describe("release manifest", () => {
	it("validates the stable release manifest contract", () => {
		const summary = assertReleaseManifest(buildManifest(), {
			changelogSource,
			expectedTag: "v0.3.0",
		});

		expect(summary).toMatchObject({
			channel: "stable",
			gitTag: "v0.3.0",
			schemaVersion: "release-manifest.v1",
			version: "0.3.0",
		});
	});

	it("rejects a supplied tag that does not match the manifest", () => {
		expect(() =>
			assertReleaseManifest(buildManifest(), {
				changelogSource,
				expectedTag: "v0.4.0",
			}),
		).toThrow("does not match supplied tag");
	});

	it("rejects a manifest without the matching changelog heading", () => {
		expect(() =>
			assertReleaseManifest(buildManifest({ changelogHeading: "## v0.3.0" }), {
				changelogSource,
			}),
		).toThrow("CHANGELOG.md must contain release heading");
	});

	it("requires stable channel for stable tags", () => {
		expect(() =>
			assertReleaseManifest(buildManifest({ channel: "rc" }), {
				changelogSource,
			}),
		).toThrow("channel must be stable");
	});

	it("parses semver prerelease tags", () => {
		expect(parseReleaseTag("v0.3.0-rc.1")).toMatchObject({
			prerelease: "rc.1",
			version: "0.3.0-rc.1",
		});
	});

	it("rejects invalid tag shapes", () => {
		expect(() => parseReleaseTag("release-0.3.0")).toThrow(
			"release tag must use",
		);
	});

	it("parses release manifest JSON", () => {
		expect(parseReleaseManifest(JSON.stringify(buildManifest()))).toMatchObject(
			{
				gitTag: "v0.3.0",
			},
		);
	});
});
