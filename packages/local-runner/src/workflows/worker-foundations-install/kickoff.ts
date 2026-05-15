import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { INSTALL_REPORT_REF } from "./constants";
import { buildCodexKickoffEnv } from "./env";
import {
	WORKER_CODEX_PROJECT_WRITE_PROFILE,
	WORKER_FOUNDATIONS_COMMIT_MESSAGE,
} from "./manifest";
import type { WorkerInstallContext, WorkerKickoffStatus } from "./types";
import {
	isGitTrackedRef,
	isTrackedInstallRef,
	runGit,
	uniqueRefs,
} from "./utils";

export async function maybeRunKickoff(
	context: WorkerInstallContext,
): Promise<WorkerKickoffStatus> {
	if (context.options.noKickoff) {
		return buildSkippedKickoff("disabled");
	}
	const prompt = [
		"Read AGENTS.md, docs/worker/install-report.md, the active Worker Foundations Program, and the first active ExecPlan.",
		"Continue from the plan and keep all proof sync-safe.",
	].join("\n");
	const result = spawnSync(
		"codex",
		[
			"--profile",
			WORKER_CODEX_PROJECT_WRITE_PROFILE,
			"--cd",
			context.repositoryRoot,
			prompt,
		],
		{
			cwd: context.repositoryRoot,
			env: buildCodexKickoffEnv(context),
			stdio: "inherit",
		},
	);
	return {
		status: result.status === 0 ? "started" : "blocked",
		promptRef: "docs/worker/install-report.md#kickoff",
		codexProfile: WORKER_CODEX_PROJECT_WRITE_PROFILE,
	};
}

export function buildSkippedKickoff(reason: string): WorkerKickoffStatus {
	return {
		status: reason === "blocked" ? "blocked" : "skipped",
		promptRef: "docs/worker/install-report.md#kickoff",
		codexProfile: WORKER_CODEX_PROJECT_WRITE_PROFILE,
	};
}

export async function commitInstallChanges({
	context,
	touchedRefs,
}: {
	context: WorkerInstallContext;
	touchedRefs: string[];
}) {
	const stageableRefs: string[] = [];
	for (const ref of uniqueRefs(touchedRefs)) {
		if (!isTrackedInstallRef(ref)) {
			continue;
		}
		if (
			existsSync(path.join(context.repositoryRoot, ref)) ||
			(await isGitTrackedRef(context.repositoryRoot, ref))
		) {
			stageableRefs.push(ref);
		}
	}
	if (stageableRefs.length === 0) {
		return null;
	}
	const addResult = await runGit(context.repositoryRoot, [
		"add",
		"--",
		...stageableRefs,
	]);
	if (!addResult.succeeded) {
		throw new Error("Could not stage Worker Foundations install files.");
	}
	const statusResult = await runGit(context.repositoryRoot, [
		"status",
		"--porcelain",
	]);
	if (statusResult.stdout.trim() === "") {
		return null;
	}
	const commitResult = await runGit(context.repositoryRoot, [
		"commit",
		"-m",
		WORKER_FOUNDATIONS_COMMIT_MESSAGE,
	]);
	if (!commitResult.succeeded) {
		throw new Error("Could not create Worker Foundations install commit.");
	}
	const hashResult = await runGit(context.repositoryRoot, [
		"rev-parse",
		"--short",
		"HEAD",
	]);
	return hashResult.succeeded ? hashResult.stdout.trim() : null;
}

export async function amendTrackedInstallReport(context: WorkerInstallContext) {
	const addResult = await runGit(context.repositoryRoot, [
		"add",
		INSTALL_REPORT_REF,
	]);
	if (!addResult.succeeded) {
		throw new Error("Could not stage final Worker Foundations install report.");
	}
	const diffResult = await runGit(context.repositoryRoot, [
		"diff",
		"--cached",
		"--quiet",
	]);
	if (diffResult.succeeded) {
		return await readHeadCommit(context);
	}
	const amendResult = await runGit(context.repositoryRoot, [
		"commit",
		"--amend",
		"--no-edit",
	]);
	if (!amendResult.succeeded) {
		throw new Error("Could not amend final Worker Foundations install report.");
	}
	return await readHeadCommit(context);
}

async function readHeadCommit(context: WorkerInstallContext) {
	const hashResult = await runGit(context.repositoryRoot, [
		"rev-parse",
		"--short",
		"HEAD",
	]);
	return hashResult.succeeded ? hashResult.stdout.trim() : null;
}
