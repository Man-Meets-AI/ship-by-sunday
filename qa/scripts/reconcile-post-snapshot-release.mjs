import { spawnSync } from "node:child_process";

import {
	buildReleaseReconcilePullRequestBody,
	buildReleaseReconcilePullRequestTitle,
	isSnapshotReleasePullRequest,
} from "./lib/release-reconcile.mjs";

function parseArgs(argv) {
	let mainCommitSha = null;
	let repoFullName = null;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--main-sha=")) {
			mainCommitSha = current.slice("--main-sha=".length);
			continue;
		}

		if (current === "--main-sha") {
			mainCommitSha = argv[index + 1] ?? null;
			index += 1;
			continue;
		}

		if (current?.startsWith("--repo=")) {
			repoFullName = current.slice("--repo=".length);
			continue;
		}

		if (current === "--repo") {
			repoFullName = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return {
		mainCommitSha,
		repoFullName,
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

function resolveGitHubRepo(explicitRepo) {
	if (explicitRepo) {
		return explicitRepo;
	}

	const remoteUrl = runCommand("git", ["remote", "get-url", "origin"]);
	const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);

	if (!match || !match[1]) {
		throw new Error(`Unable to parse a GitHub repository from origin remote ${remoteUrl}.`);
	}

	return match[1];
}

function readAssociatedPullRequests({ mainCommitSha, repoFullName }) {
	return (
		runJsonCommand("gh", [
			"api",
			`repos/${repoFullName}/commits/${mainCommitSha}/pulls`,
		]) ?? []
	);
}

function readExistingReconcilePullRequest({ repoFullName }) {
	const pullRequests =
		runJsonCommand("gh", [
			"pr",
			"list",
			"--repo",
			repoFullName,
			"--base",
			"dev",
			"--head",
			"main",
			"--state",
			"open",
			"--json",
			"number,title,url",
		]) ?? [];

	return pullRequests[0] ?? null;
}

function createReconcilePullRequest({
	mainCommitSha,
	repoFullName,
	snapshotReleasePullRequest,
}) {
	const title = buildReleaseReconcilePullRequestTitle(snapshotReleasePullRequest);
	const body = buildReleaseReconcilePullRequestBody({
		mainCommitSha,
		snapshotReleasePullRequest,
	});

	const url = runCommand("gh", [
		"pr",
		"create",
		"--repo",
		repoFullName,
		"--base",
		"dev",
		"--head",
		"main",
		"--title",
		title,
		"--body",
		body,
	]);

	return {
		title,
		url,
	};
}

function main() {
	const { mainCommitSha, repoFullName: explicitRepo } = parseArgs(
		process.argv.slice(2),
	);

	if (!mainCommitSha) {
		throw new Error(
			"reconcile-post-snapshot-release requires --main-sha=<sha>.",
		);
	}

	const repoFullName = resolveGitHubRepo(explicitRepo);
	const associatedPullRequests = readAssociatedPullRequests({
		mainCommitSha,
		repoFullName,
	});
	const snapshotReleasePullRequest = associatedPullRequests.find(
		isSnapshotReleasePullRequest,
	);

	if (!snapshotReleasePullRequest) {
		process.stdout.write(
			`${JSON.stringify(
				{
					action: "noop",
					mainCommitSha,
					reason:
						"Merged main commit is not associated with a merged snapshot release PR.",
					repoFullName,
				},
				null,
				2,
			)}\n`,
		);
		return;
	}

	const existingReconcilePullRequest = readExistingReconcilePullRequest({
		repoFullName,
	});
	if (existingReconcilePullRequest) {
		process.stdout.write(
			`${JSON.stringify(
				{
					action: "reuse",
					existingReconcilePullRequest,
					mainCommitSha,
					repoFullName,
					snapshotReleasePullRequest: {
						number: snapshotReleasePullRequest.number,
						url: snapshotReleasePullRequest.html_url,
					},
				},
				null,
				2,
			)}\n`,
		);
		return;
	}

	const createdReconcilePullRequest = createReconcilePullRequest({
		mainCommitSha,
		repoFullName,
		snapshotReleasePullRequest,
	});
	process.stdout.write(
		`${JSON.stringify(
			{
				action: "create",
				createdReconcilePullRequest,
				mainCommitSha,
				repoFullName,
				snapshotReleasePullRequest: {
					number: snapshotReleasePullRequest.number,
					url: snapshotReleasePullRequest.html_url,
				},
			},
			null,
			2,
		)}\n`,
	);
}

main();
