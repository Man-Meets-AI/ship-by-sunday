import { existsSync } from "node:fs";
import path from "node:path";

import { runBoundedProcess } from "./bounded-process";
import type { SetupCheckResult } from "./github-readiness";

async function runGit(repositoryRoot: string, args: string[]) {
	return await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
	});
}

function detectPackageManager(repositoryRoot: string) {
	if (existsSync(path.join(repositoryRoot, "bun.lock"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) {
		return "pnpm";
	}
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) {
		return "yarn";
	}
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) {
		return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "package.json"))) {
		return "unknown";
	}
	return null;
}

export async function runProjectSetupChecks({
	repositoryRoot,
	isGitRepository,
}: {
	repositoryRoot: string;
	isGitRepository: boolean;
}): Promise<SetupCheckResult[]> {
	const checks: SetupCheckResult[] = [
		{
			scope: "project",
			checkKey: "git-repository",
			status: isGitRepository ? "ready" : "blocked",
			summary: isGitRepository
				? "Project root is inside a Git repository."
				: "Project root is not inside a Git repository.",
			remediationAction: isGitRepository
				? undefined
				: "Run from a Git repository or initialize Git first.",
		},
	];

	if (!isGitRepository) {
		return checks;
	}

	const remoteCheck = await runGit(repositoryRoot, [
		"remote",
		"get-url",
		"origin",
	])
		.then((result) => result.succeeded)
		.catch(() => false);
	const statusOutput = await runGit(repositoryRoot, ["status", "--porcelain"])
		.then(({ stdout }) => stdout)
		.catch(() => "");
	const packageManager = detectPackageManager(repositoryRoot);

	checks.push(
		{
			scope: "project",
			checkKey: "git-origin",
			status: remoteCheck ? "ready" : "warning",
			summary: remoteCheck
				? "Git origin remote is configured."
				: "Git origin remote is not configured.",
			remediationAction: remoteCheck
				? undefined
				: "Add an origin remote before future Work/Run workflows.",
		},
		{
			scope: "project",
			checkKey: "git-worktree-state",
			status: statusOutput.trim() ? "warning" : "ready",
			summary: statusOutput.trim()
				? "Git worktree has local changes."
				: "Git worktree is clean.",
			remediationAction: statusOutput.trim()
				? "Review local changes before future Work/Run workflows."
				: undefined,
		},
		{
			scope: "project",
			checkKey: "package-manager",
			status: packageManager ? "ready" : "warning",
			summary: packageManager
				? `Detected ${packageManager} project tooling.`
				: "No package manager files were detected.",
			remediationAction: packageManager
				? undefined
				: "This is fine for non-JavaScript projects; future probes may need manual commands.",
		},
	);

	return checks;
}
