import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../../../../scripts/release/export-release-intake.mjs";

const temporaryDirectories: string[] = [];

function createOutputPath() {
	const tempDirectory = mkdtempSync(
		path.join(tmpdir(), "release-intake-export-"),
	);
	temporaryDirectories.push(tempDirectory);
	return path.join(tempDirectory, "release-intake.v1.json");
}

describe("export-release-intake command", () => {
	afterEach(() => {
		for (const tempDirectory of temporaryDirectories.splice(0)) {
			rmSync(tempDirectory, { force: true, recursive: true });
		}
	});

	it("builds the release intake document from the shared release summary collector", async () => {
		const outputPath = createOutputPath();
		const writeFileMock = vi.fn(async (filePath, contents) => {
			writeFileSync(filePath, contents, "utf8");
		});

		const result = await runCli({
			args: ["--output", outputPath],
			collectReleaseTriageSummaryImpl: async () => ({
				candidate: {
					ref: "origin/dev",
					sha: "candidate-sha",
					baseRef: "origin/main",
					baseSha: "base-sha",
				},
				proof: {
					aliasDomain: "dev.man-meets-ai.com",
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
					ready: false,
					requiredChecks: ["release_scope", "default_ship", "release_gate"],
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
			}),
			writeReleaseSummaryImpl: async ({ summary }) => {
				await writeFileMock(
					outputPath,
					`${JSON.stringify(summary, null, 2)}\n`,
				);
			},
		});

		expect(result.document.items).toHaveLength(1);
		expect(result.document.items[0].blockerKey).toBe("release_gate");
		expect(writeFileMock).toHaveBeenCalledOnce();
	});
});
