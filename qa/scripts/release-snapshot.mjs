import { spawnSync } from "node:child_process";
import process from "node:process";

import {
	buildReleaseSnapshotBranchName,
	buildReleaseSnapshotPlan,
	evaluateReleaseSnapshotEligibility,
} from "./lib/release-snapshot.mjs";

function parseArgs(argv) {
	let branchName = null;
	let dryRun = false;
	let pushBranch = false;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current === "--dry-run") {
			dryRun = true;
			continue;
		}

		if (current === "--push") {
			pushBranch = true;
			continue;
		}

		if (current?.startsWith("--branch=")) {
			branchName = current.slice("--branch=".length);
			continue;
		}

		if (current === "--branch") {
			branchName = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return {
		branchName,
		dryRun,
		pushBranch,
	};
}

function runCommand(command, args) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		throw new Error(
			result.stderr.trim() ||
				`${command} ${args.join(" ")} failed with status ${result.status ?? 1}.`,
		);
	}

	return result.stdout.trim();
}

function runJsonCommand(command, args) {
	const output = runCommand(command, args);
	return output.length === 0 ? null : JSON.parse(output);
}

function resolveGitHubRepo() {
	const remoteUrl = runCommand("git", ["remote", "get-url", "origin"]);
	const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);

	if (!match || !match[1]) {
		throw new Error(`Unable to parse a GitHub repository from origin remote ${remoteUrl}.`);
	}

	return match[1];
}

function readReleasePullRequest({ repoFullName }) {
	const pullRequests =
		runJsonCommand("gh", [
			"pr",
			"list",
			"--repo",
			repoFullName,
			"--base",
			"main",
			"--head",
			"dev",
			"--state",
			"open",
			"--json",
			"number",
		]) ?? [];

	if (pullRequests.length === 0) {
		return null;
	}

	return runJsonCommand("gh", [
		"pr",
		"view",
		String(pullRequests[0].number),
		"--repo",
		repoFullName,
		"--json",
		[
			"baseRefName",
			"headRefName",
			"headRefOid",
			"isDraft",
			"mergeStateStatus",
			"mergeable",
			"number",
			"state",
			"title",
			"url",
		].join(","),
	]);
}

function ensureCleanWorktree() {
	const status = runCommand("git", ["status", "--short"]);
	if (status.length > 0) {
		throw new Error(
			"Snapshot release creation requires a clean worktree. Commit or stash local changes first.",
		);
	}
}

function main() {
	const { branchName, dryRun, pushBranch } = parseArgs(process.argv.slice(2));
	const candidateSha = runCommand("git", ["rev-parse", "origin/dev"]);
	const candidateTreeSha = runCommand("git", ["rev-parse", "origin/dev^{tree}"]);
	const mainSha = runCommand("git", ["rev-parse", "origin/main"]);
	const resolvedBranchName = branchName || buildReleaseSnapshotBranchName();
	const repoFullName = resolveGitHubRepo();
	const releasePullRequest = readReleasePullRequest({ repoFullName });
	const eligibility = evaluateReleaseSnapshotEligibility({
		baseBranchName: "main",
		candidateSha,
		headBranchName: "dev",
		releasePullRequest,
	});
	const plan = buildReleaseSnapshotPlan({
		branchName: resolvedBranchName,
		candidateSha,
		candidateTreeSha,
		mainSha,
	});

	if (!eligibility.allowed) {
		process.stdout.write(
			`${JSON.stringify(
				{
					allowed: false,
					dryRun,
					eligibility,
					plan,
					releasePullRequest,
				},
				null,
				2,
			)}\n`,
		);
		process.exit(1);
	}

	if (dryRun) {
		process.stdout.write(
			`${JSON.stringify(
				{
					allowed: true,
					dryRun: true,
					eligibility,
					plan,
					releasePullRequest,
				},
				null,
				2,
			)}\n`,
		);
		return;
	}

	ensureCleanWorktree();
	const snapshotCommitSha = runCommand("git", [
		"commit-tree",
		candidateTreeSha,
		"-p",
		mainSha,
		"-m",
		plan.commitMessage,
	]);
	runCommand("git", ["branch", resolvedBranchName, snapshotCommitSha]);
	const snapshotTreeSha = runCommand("git", ["rev-parse", `${resolvedBranchName}^{tree}`]);

	if (snapshotTreeSha !== candidateTreeSha) {
		throw new Error(
			`Snapshot branch ${resolvedBranchName} does not match origin/dev tree ${candidateTreeSha}.`,
		);
	}

	if (pushBranch) {
		runCommand("git", ["push", "origin", `${resolvedBranchName}:${resolvedBranchName}`]);
	}

	process.stdout.write(
		`${JSON.stringify(
			{
				allowed: true,
				dryRun: false,
				eligibility,
				plan,
				pushed: pushBranch,
				releasePullRequest,
				snapshotCommitSha,
				treeIdentityVerified: true,
			},
			null,
			2,
		)}\n`,
	);
}

main();
