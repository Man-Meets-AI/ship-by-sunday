import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "../../core/bounded-process";
import { inspectShipbysundayWorkerCodexConfig } from "../../core/codex-config-manager";
import type { JsonObject } from "../../core/json-value";
import { findManagedFileBlockers } from "./apply";
import { buildWorkerProcessEnv } from "./env";
import { inspectWorkerLicense } from "./license";
import type {
	RootPackageManager,
	TargetRepoInspection,
	WorkerInstallBlocker,
	WorkerInstallContext,
	WorkerNodeRuntimePlan,
} from "./types";
import {
	detectRootPackageManager,
	gitBranchExists,
	isGitWorktreeClean,
	parseJsonObject,
	readCurrentBranch,
} from "./utils";

export async function inspectTargetRepository(
	context: WorkerInstallContext,
): Promise<TargetRepoInspection> {
	const blockers: WorkerInstallBlocker[] = [];
	const packageJsonRef = path.join(context.repositoryRoot, "package.json");
	const packageJsonExists = existsSync(packageJsonRef);
	let packageJsonText = "";
	let packageJson: JsonObject = {};
	if (packageJsonExists) {
		packageJsonText = await readFile(packageJsonRef, "utf8");
		const parsedPackageJson = parseJsonObject(packageJsonText);
		if (!parsedPackageJson) {
			blockers.push({
				blockerId: "root-package-json",
				targetRef: "package.json",
				reason: "Root package.json must parse as a JSON object.",
			});
		} else {
			packageJson = parsedPackageJson;
		}
	}
	const packageManager = detectRootPackageManager({
		packageJson,
		repositoryRoot: context.repositoryRoot,
	});
	if (process.platform === "win32") {
		blockers.push({
			blockerId: "unsupported-platform",
			reason:
				"Worker Foundations install currently supports macOS and Linux targets only.",
		});
	}

	const gitClean = await isGitWorktreeClean(context.repositoryRoot);
	if (!gitClean) {
		blockers.push({
			blockerId: "clean-worktree",
			reason: "Install requires a clean Git worktree before mutation.",
		});
	}

	const licenseStatus = await inspectWorkerLicense(context);
	if (licenseStatus.status !== "active") {
		blockers.push({
			blockerId: "license",
			reason:
				licenseStatus.status === "missing"
					? "License activation is missing. Run shipbysunday install interactively after signing in."
					: licenseStatus.reason,
		});
	}

	const nodeRuntime = await inspectWorkerNodeRuntime(context);
	if (nodeRuntime.status === "blocked") {
		blockers.push({
			blockerId: "worker-node-runtime",
			reason: "Node is required for Worker proof commands.",
		});
	}
	const packageManagerCommandStatus = await inspectPackageManagerCommand({
		context,
		packageManager,
	});
	if (packageManagerCommandStatus === "blocked") {
		blockers.push({
			blockerId: "package-manager-command",
			reason: `Detected ${packageManager} package-manager identity, but the ${packageManager} command is not available for Worker proof commands.`,
		});
	}

	const codexStatus = context.options.noKickoff
		? "skipped"
		: await inspectCodexAvailability(context);
	if (codexStatus === "blocked") {
		blockers.push({
			blockerId: "codex",
			reason:
				"Codex is required for the default auto-kickoff path. Run codex login before installing.",
		});
	}

	let codexProfileStatus: TargetRepoInspection["codexProfileStatus"] = context
		.options.noKickoff
		? "skipped"
		: "planned";
	if (!context.options.noKickoff) {
		const inspection = await inspectShipbysundayWorkerCodexConfig({
			env: context.env,
			repositoryRoot: context.repositoryRoot,
		});
		if (inspection.hasExplicitUntrustedProject) {
			codexProfileStatus = "blocked";
			blockers.push({
				blockerId: "codex-trust",
				reason:
					"Codex marks this repository as untrusted. Trust the repo before installing Worker Foundations.",
			});
		} else if (
			inspection.hasReadonlyProfile &&
			inspection.hasProjectWriteProfile &&
			inspection.hasReadonlyPermissions &&
			inspection.hasProjectWritePermissions
		) {
			codexProfileStatus = "ready";
		}
	}
	blockers.push(...(await findManagedFileBlockers(context, packageManager)));

	return {
		packageManager,
		packageJsonText,
		packageJson,
		packageJsonExists,
		gitClean,
		currentBranch: await readCurrentBranch(context.repositoryRoot),
		installBranchExists: await gitBranchExists(context.repositoryRoot),
		licenseStatus,
		nodeRuntime,
		codexStatus,
		codexProfileStatus,
		blockers,
	};
}

async function inspectCodexAvailability(context: WorkerInstallContext) {
	const versionResult = await runBoundedProcess({
		command: "codex",
		args: ["--version"],
		cwd: context.repositoryRoot,
		env: context.env,
	});
	if (!versionResult.succeeded) {
		return "blocked" as const;
	}
	const loginResult = await runBoundedProcess({
		command: "codex",
		args: ["login", "status"],
		cwd: context.repositoryRoot,
		env: context.env,
	});
	return loginResult.succeeded ? ("ready" as const) : ("blocked" as const);
}

async function inspectWorkerNodeRuntime(
	context: WorkerInstallContext,
): Promise<WorkerNodeRuntimePlan> {
	const result = await runBoundedProcess({
		command: "node",
		args: ["--version"],
		cwd: context.repositoryRoot,
		env: buildWorkerProcessEnv(context),
		timeoutMs: 5_000,
	});
	return result.succeeded
		? {
				runtime: "node",
				status: "available",
				origin: "path",
				targetRef: "system-node",
			}
		: {
				runtime: "node",
				status: "blocked",
				origin: "missing",
				targetRef: "system-node",
			};
}

async function inspectPackageManagerCommand({
	context,
	packageManager,
}: {
	context: WorkerInstallContext;
	packageManager: RootPackageManager;
}) {
	const result = await runBoundedProcess({
		command: packageManager,
		args: ["--version"],
		cwd: context.repositoryRoot,
		env: buildWorkerProcessEnv(context),
		timeoutMs: 5_000,
	});
	return result.succeeded ? ("ready" as const) : ("blocked" as const);
}
