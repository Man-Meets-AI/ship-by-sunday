import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
	buildReleaseSnapshotBranchName,
	buildReleaseSnapshotCommitMessage,
	createReleaseSnapshotBranch,
	readHeadParent,
	readTrackedTree,
} from "../lib/release-snapshot.mjs";

function git(cwd, args) {
	const result = spawnSync("git", args, {
		cwd,
		encoding: "utf8",
	});

	if (result.status !== 0) {
		throw new Error(
			`git ${args.join(" ")} failed in ${cwd}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
		);
	}

	return result.stdout.trim();
}

async function createFixtureRepo() {
	const repoDir = await mkdtemp(
		path.join(os.tmpdir(), "ship-by-sunday-release-snapshot-test-"),
	);

	git(repoDir, ["init", "-b", "main"]);
	git(repoDir, ["config", "user.email", "codex@example.com"]);
	git(repoDir, ["config", "user.name", "Codex"]);

	await writeFile(path.join(repoDir, "shared.txt"), "main-base\n");
	await writeFile(path.join(repoDir, "only-main.txt"), "only-main\n");
	git(repoDir, ["add", "."]);
	git(repoDir, ["commit", "-m", "main: base"]);
	const mainHead = git(repoDir, ["rev-parse", "HEAD"]);

	git(repoDir, ["checkout", "-b", "dev"]);
	await writeFile(path.join(repoDir, "shared.txt"), "dev-version\n");
	await writeFile(path.join(repoDir, "only-dev.txt"), "only-dev\n");
	git(repoDir, ["rm", "only-main.txt"]);
	git(repoDir, ["add", "."]);
	git(repoDir, ["commit", "-m", "dev: candidate"]);
	const devHead = git(repoDir, ["rev-parse", "HEAD"]);

	git(repoDir, ["checkout", "main"]);
	return {
		devHead,
		mainHead,
		repoDir,
	};
}

test("release snapshot helper builds branch names and commit messages", () => {
	const branchName = buildReleaseSnapshotBranchName({
		now: new Date("2026-04-15T15:00:00Z"),
		sourceRef: "origin/dev",
	});

	assert.match(branchName, /^release\/snapshot-dev-20260415t150000$/);
	assert.equal(
		buildReleaseSnapshotCommitMessage({
			baseRef: "origin/main",
			sourceRef: "origin/dev",
		}),
		"release: promote dev snapshot to main",
	);
});

test("release snapshot branch tip uses main as parent and dev as tree", async () => {
	const { devHead, mainHead, repoDir } = await createFixtureRepo();
	const result = await createReleaseSnapshotBranch({
		baseRef: "main",
		branchName: "release/test-snapshot",
		commitMessage: "release: promote dev snapshot to main",
		repoDir,
		sourceRef: "dev",
	});

	assert.equal(result.commitSha.length, 40);
	assert.equal(await readHeadParent(repoDir, "release/test-snapshot"), mainHead);
	assert.deepEqual(
		await readTrackedTree(repoDir, "release/test-snapshot"),
		await readTrackedTree(repoDir, devHead),
	);
});
