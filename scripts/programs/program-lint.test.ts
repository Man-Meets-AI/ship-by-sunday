import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "bun:test";

import { lintProgramDocument } from "./document-lint";
import { lintProgramPacket } from "./frontmatter-lint";

const createdAt = "2026-04-24";
const programId = "example-program";
const programDir = `docs/programs/active/${createdAt}-${programId}`;

async function withTempRepo(
	run: (repoRootDir: string) => Promise<void>,
): Promise<void> {
	const repoRootDir = await mkdtemp(path.join(os.tmpdir(), "sbs-programs-"));
	try {
		await run(repoRootDir);
	} finally {
		await rm(repoRootDir, { recursive: true, force: true });
	}
}

async function writeRepoFile(
	repoRootDir: string,
	repoPath: string,
	contents: string,
): Promise<void> {
	const targetPath = path.join(repoRootDir, repoPath);
	await mkdir(path.dirname(targetPath), { recursive: true });
	await writeFile(targetPath, contents, "utf8");
}

function buildProgramDocument(): string {
	return [
		"---",
		`program_id: '${programId}'`,
		"title: 'Example Program'",
		"status: 'active'",
		`created_at: ${createdAt}`,
		"completed_at: null",
		"summary: 'Coordinate one multi-slice initiative.'",
		"post_build_recap: null",
		"read_when:",
		"  - 'Testing Program packet validation.'",
		"---",
		"",
		"# Example Program",
		"",
		"This is a living initiative document.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"Purpose.",
		"",
		"## Program Inputs",
		"Inputs.",
		"",
		"## Current State",
		"State.",
		"",
		"## Progress",
		"- [x] 2026-04-24 EDT: Created packet.",
		"",
		"## Decision Log",
		"Decision.",
		"",
		"## Slice Ledger",
		"Slice.",
		"",
		"## Next Slice",
		"Next.",
		"",
		"## Risks and Watchpoints",
		"Risk.",
		"",
		"## Outcomes & Retrospective",
		"Outcome.",
		"",
		"## Validation and Acceptance",
		"Validation.",
		"",
		"## Artifacts and Notes",
		"Artifact.",
		"",
		"## Interfaces and Dependencies",
		"Dependency.",
		"",
	].join("\n");
}

test("Program document and packet lint accept the canonical minimum packet", async () => {
	await withTempRepo(async (repoRootDir) => {
		await writeRepoFile(repoRootDir, `${programDir}/program.md`, buildProgramDocument());
		await writeRepoFile(repoRootDir, `${programDir}/track-1-research.md`, "# Research\n");
		await writeRepoFile(
			repoRootDir,
			`${programDir}/normalized-track-1.md`,
			"# Normalized\n",
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/converged-decision-packet.md`,
			"# Converged Decision Packet\n",
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/dependency-graph.md`,
			"# Dependency Graph\n",
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/plan-split-recommendation.md`,
			"# Plan Split Recommendation\n",
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/cross-repo-review.md`,
			"# Cross-Repo Review\n",
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/planning-brief-1.md`,
			[
				"---",
				"title: 'Example Planning Brief'",
				`program_id: ${programId}`,
				"brief_version: 1",
				"status: current",
				"summary: 'Define the first slice.'",
				"read_when:",
				"  - 'Writing the first child ExecPlan.'",
				"---",
				"",
				"# Example Planning Brief",
				"",
			].join("\n"),
		);
		await writeRepoFile(
			repoRootDir,
			`${programDir}/current-planning-brief.txt`,
			"planning-brief-1.md\n",
		);

		const documentReport = await lintProgramDocument({
			repoRootDir,
			programPath: `${programDir}/program.md`,
		});
		const packetReport = await lintProgramPacket({
			createdAt,
			programId,
			repoRootDir,
			rootKind: "active",
		});

		assert.deepEqual(documentReport.issues, []);
		assert.deepEqual(packetReport.issues, []);
	});
});
