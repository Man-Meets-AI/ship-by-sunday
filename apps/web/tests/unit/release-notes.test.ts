import { describe, expect, it } from "vitest";

import {
	buildReleaseNotes,
	extractChangelogSection,
	runCli as buildReleaseNotesCli,
} from "../../../../scripts/release/build-release-notes.mjs";

const changelogSource = [
	"# Changelog",
	"",
	"Release notes are published on GitHub Releases.",
	"",
	"## v0.4.0 - Unreleased",
	"",
	"### Changed",
	"",
	"- Prepare the next release.",
	"",
	"### Changelog",
	"",
	"Full Changelog: https://github.com/Man-Meets-AI/ship-by-sunday/compare/v0.3.0...v0.4.0",
	"",
	"## v0.3.0 - 2026-04-25",
	"",
	"### Highlights",
	"",
	"- Previous release.",
].join("\n");

const manifest = {
	schemaVersion: "release-manifest.v1",
	version: "0.4.0",
	channel: "stable",
	gitTag: "v0.4.0",
	changelogHeading: "## v0.4.0 - Unreleased",
	releaseEvidenceSchemaVersion: "release-evidence.v1",
};

const passedProof = {
	notes: null,
	runId: "1",
	status: "passed",
	url: "https://github.com/Man-Meets-AI/ship-by-sunday/actions/runs/1",
};

const evidence = {
	schemaVersion: "release-evidence.v1",
	version: "0.4.0",
	gitTag: "v0.4.0",
	tagTargetSha: "main-sha",
	mainSha: "main-sha",
	branchModel: "tag_attests_main",
	releaseChannel: "stable",
	changelogHeading: "## v0.4.0 - Unreleased",
	githubRelease: {
		notes: "GitHub Release publication has not run yet.",
		runId: null,
		status: "pending",
		url: null,
	},
	workflowRuns: [],
	vercel: passedProof,
	convex: passedProof,
	billing: {
		notes: "Release scope was not billing-sensitive.",
		runId: null,
		status: "not_required",
		url: null,
	},
	auth: passedProof,
	entitlement: passedProof,
	blockers: [],
	generatedAt: "2026-04-25T00:00:00.000Z",
};

const dryRunEvidence = {
	...evidence,
	vercel: {
		notes: "Vercel production proof was not supplied.",
		runId: null,
		status: "unavailable",
		url: null,
	},
	blockers: ["Vercel production proof is unavailable."],
};

describe("release notes", () => {
	it("extracts the matching changelog section without the next release", () => {
		const section = extractChangelogSection({
			changelogSource,
			heading: manifest.changelogHeading,
		});

		expect(section).toContain("- Prepare the next release.");
		expect(section).toContain("Full Changelog:");
		expect(section).not.toContain("Previous release.");
	});

	it("adds release evidence to the GitHub Release body", () => {
		const notes = buildReleaseNotes({
			changelogSection: "### Changed\n\n- Prepare the next release.\n",
			evidence,
		});

		expect(notes).toContain("## Release Evidence");
		expect(notes).toContain("- Target commit: `main-sha`");
		expect(notes).toContain("- Billing proof: `not_required`");
	});

	it("builds notes from the manifest changelog heading", async () => {
		let writtenNotes = "";
		const notes = await buildReleaseNotesCli({
			args: [
				"--manifest=release.json",
				"--changelog=CHANGELOG.md",
				"--evidence=release-evidence.publish-check.json",
				"--output=release-notes.md",
			],
			readFileImpl: async (path) => {
				if (path === "release.json") {
					return JSON.stringify(manifest);
				}

				if (path === "CHANGELOG.md") {
					return changelogSource;
				}

				if (path === "release-evidence.publish-check.json") {
					return JSON.stringify(evidence);
				}

				throw new Error(`Unexpected read path: ${path}`);
			},
			writeFileImpl: async (_path, contents) => {
				writtenNotes = contents;
			},
			writeStdout: () => undefined,
		});

		expect(notes).toBe(writtenNotes);
		expect(notes).toContain("### Changed");
		expect(notes).toContain("## Release Evidence");
		expect(notes).toContain(
			"- Evidence artifact: `release-evidence.publish-check.json`",
		);
	});

	it("allows dry-run evidence in release-note artifacts", async () => {
		const notes = await buildReleaseNotesCli({
			args: [
				"--manifest=release.json",
				"--changelog=CHANGELOG.md",
				"--evidence=release-evidence.v1.json",
			],
			readFileImpl: async (path) => {
				if (path === "release.json") {
					return JSON.stringify(manifest);
				}

				if (path === "CHANGELOG.md") {
					return changelogSource;
				}

				if (path === "release-evidence.v1.json") {
					return JSON.stringify(dryRunEvidence);
				}

				throw new Error(`Unexpected read path: ${path}`);
			},
			writeStdout: () => undefined,
		});

		expect(notes).toContain("- Vercel production proof: `unavailable`");
		expect(notes).toContain("- Evidence artifact: `release-evidence.v1.json`");
	});
});
