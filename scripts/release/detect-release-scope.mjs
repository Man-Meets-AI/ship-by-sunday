import { appendFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import process from "node:process";

import { classifyReleaseScope } from "./lib/release-scope.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function getChangedFiles(baseRef, headRef) {
	const result = spawnSync("git", ["diff", "--name-only", `${baseRef}..${headRef}`], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		throw new Error(
			result.stderr.trim() ||
				`git diff failed for ${baseRef}..${headRef} with status ${result.status ?? 1}.`,
		);
	}

	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

async function writeGitHubOutput(summary) {
	const githubOutputPath = process.env.GITHUB_OUTPUT;
	if (!githubOutputPath) {
		return;
	}

	await appendFile(
		githubOutputPath,
		[
			`billing_sensitive=${summary.billingSensitive ? "true" : "false"}`,
			`convex_sensitive=${summary.convexSensitive ? "true" : "false"}`,
			`changed_files_count=${summary.changedFiles.length}`,
		].join("\n") + "\n",
		"utf8",
	);
}

async function writeJsonOutput(summary, outputPath) {
	if (!outputPath) {
		return;
	}

	await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const baseRef = options.base?.trim();
	const headRef = options.head?.trim();

	if (!baseRef || !headRef) {
		throw new Error("detect-release-scope requires both --base=<ref> and --head=<ref>.");
	}

	const changedFiles = getChangedFiles(baseRef, headRef);
	const summary = {
		baseRef,
		headRef,
		...classifyReleaseScope(changedFiles),
	};

	await writeGitHubOutput(summary);
	await writeJsonOutput(summary, options.output?.trim());
	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

await main();
