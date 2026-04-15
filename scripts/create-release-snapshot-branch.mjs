#!/usr/bin/env node

import {
	buildReleaseSnapshotBranchName,
	buildReleaseSnapshotCommitMessage,
	createReleaseSnapshotBranch,
} from "./lib/release-snapshot.mjs";

function parseArgs(argv) {
	const options = {};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current.startsWith("--")) {
			continue;
		}

		if (current === "--push") {
			options.push = true;
			continue;
		}

		const [key, value] = current.replace(/^--/, "").split("=");
		if (typeof value === "string") {
			options[key] = value;
			continue;
		}

		options[key] = argv[index + 1] ?? "";
		index += 1;
	}

	return options;
}

const options = parseArgs(process.argv.slice(2));
const sourceRef = options["source-ref"] || "origin/dev";
const baseRef = options["base-ref"] || "origin/main";
const branchName =
	options.branch ||
	buildReleaseSnapshotBranchName({
		sourceRef,
	});
const commitMessage =
	options["commit-message"] ||
	buildReleaseSnapshotCommitMessage({
		baseRef,
		sourceRef,
	});

const result = await createReleaseSnapshotBranch({
	baseRef,
	branchName,
	commitMessage,
	push: options.push === true,
	repoDir: options["repo-dir"] || process.cwd(),
	sourceRef,
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
