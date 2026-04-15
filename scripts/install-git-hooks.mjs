import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function runGitCommand(args) {
	const result = spawnSync("git", args, {
		cwd: process.cwd(),
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	return {
		status: result.status ?? 1,
		stdout: result.stdout.trim(),
		stderr: result.stderr.trim(),
	};
}

const rootResult = runGitCommand(["rev-parse", "--show-toplevel"]);
if (rootResult.status !== 0) {
	console.error(
		rootResult.stderr || "Unable to resolve the git repository root for hook installation.",
	);
	process.exit(rootResult.status);
}

const repoRoot = rootResult.stdout;
const hooksPath = ".githooks";
const configResult = runGitCommand(["config", "core.hooksPath", hooksPath]);

if (configResult.status !== 0) {
	console.error(
		configResult.stderr || "Unable to configure git core.hooksPath for this repository.",
	);
	process.exit(configResult.status);
}

console.log(`Configured git hooks for ${repoRoot}: ${path.join(repoRoot, hooksPath)}`);
