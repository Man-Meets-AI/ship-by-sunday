import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
	chmod,
	copyFile,
	mkdir,
	mkdtemp,
	readFile,
	realpath,
	rm,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runBoundedProcess } from "../../core/bounded-process";
import {
	applyShipbysundayWorkerCodexConfigPatch,
	inspectShipbysundayWorkerCodexConfig,
	rollbackShipbysundayWorkerCodexConfigPatch,
} from "../../core/codex-config-manager";
import type { JsonObject, JsonValue } from "../../core/json-value";
import { assertSyncSafeValue } from "../../core/redaction";
import { resolveRepositoryRoot } from "../../core/repository-root";
import {
	WORKER_CODEX_PROJECT_WRITE_PROFILE,
	WORKER_BUN_DOWNLOAD_SHA256_ENV_VAR,
	WORKER_BUN_EXECUTABLE_ENV_VAR,
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_COMMIT_MESSAGE,
	WORKER_FOUNDATIONS_INSTALL_BRANCH,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
	WORKER_FOUNDATIONS_PROOF_SCRIPTS,
	WORKER_FOUNDATIONS_ROOT_SCRIPTS,
	WORKER_BUN_DOWNLOAD_URL_ENV_VAR,
	WORKER_LICENSE_API_BASE_URL_ENV_VAR,
	WORKER_LICENSE_OPEN_BROWSER_ENV_VAR,
	WORKER_MACHINE_HOME_ENV_VAR,
	type WorkerFoundationsRootScript,
} from "./manifest";

export type WorkerInstallOptions = {
	dryRun: boolean;
	json: boolean;
	noCommit: boolean;
	noKickoff: boolean;
	repoPath?: string;
	yes: boolean;
};

export type WorkerInstallResult = {
	outcome: "ready" | "installed" | "blocked" | "failed" | "cancelled";
	exitCode: 0 | 1 | 2 | 130;
	summary: string;
	report?: WorkerInstallReport;
};

type WorkerInstallReport = {
	schemaVersion: "worker-foundations-install-result.v1";
	workflowId: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID;
	workflowVersion: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION;
	outcome: WorkerInstallResult["outcome"];
	workerBundleVersion: string;
	branch: string | null;
	commit: string | null;
	dryRun: boolean;
	phases: WorkerInstallPhase[];
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	reportRef: string | null;
	localProofRef: string | null;
	kickoff: WorkerKickoffStatus;
	privacyBoundary: WorkerPrivacyBoundary;
};

type WorkerInstallPhase = {
	name: string;
	status: "ready" | "planned" | "applied" | "blocked" | "failed" | "skipped";
	reason?: string;
};

type WorkerInstallPlan = {
	schemaVersion: "worker-foundations-install-plan.v1";
	workflowId: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID;
	workflowVersion: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION;
	workerBundleVersion: string;
	packageManager: RootPackageManager;
	toolchain: WorkerBunToolchainPlan;
	operations: WorkerInstallOperation[];
	blockers: WorkerInstallBlocker[];
	proofCommands: string[];
	privacyBoundary: WorkerPrivacyBoundary;
};

type WorkerBunToolchainPlan = {
	runtime: "bun";
	status: "available" | "managed" | "provisionable" | "blocked";
	origin:
		| "path"
		| "worker-managed"
		| "current-runtime"
		| "explicit-env"
		| "download"
		| "missing";
	targetRef: "worker-home/toolchains/bun/bin/bun";
};

type WorkerInstallOperation = {
	operationId: string;
	surface: string;
	targetRef: string;
	status: "add" | "update-managed" | "keep" | "planned" | "blocked";
	reason: string;
};

type WorkerInstallBlocker = {
	blockerId: string;
	targetRef?: string;
	reason: string;
};

type WorkerProofCommandStatus = {
	command: string;
	status: "passed" | "failed" | "skipped";
};

type WorkerKickoffStatus = {
	status: "started" | "skipped" | "blocked";
	promptRef: string;
	codexProfile: typeof WORKER_CODEX_PROJECT_WRITE_PROFILE;
};

type WorkerPrivacyBoundary = {
	rawSourceIncluded: false;
	rawLogsIncluded: false;
	packageScriptBodiesIncluded: false;
	dependencyVersionsIncluded: false;
	localAbsolutePathsIncluded: false;
	codexTranscriptsIncluded: false;
};

type WorkerInstallContext = {
	env: NodeJS.ProcessEnv;
	now: number;
	options: WorkerInstallOptions;
	repositoryRoot: string;
	workerHome: string;
	runId: string;
};

type TargetRepoInspection = {
	packageManager: RootPackageManager;
	packageJsonText: string;
	packageJson: JsonObject;
	packageJsonExists: boolean;
	gitClean: boolean;
	currentBranch: string | null;
	installBranchExists: boolean;
	licenseStatus: WorkerLicenseStatus;
	bunToolchain: WorkerBunToolchainPlan;
	codexStatus: "ready" | "blocked" | "skipped";
	codexProfileStatus: "ready" | "planned" | "blocked" | "skipped";
	blockers: WorkerInstallBlocker[];
};

type WorkerLicenseStatus =
	| { status: "active" }
	| { reason: string; status: "missing" | "invalid" };

type WorkerLicenseFile = {
	accountId?: string;
	expires_at?: string;
	issued_at?: string;
	machineCredential: string;
	machineId?: string;
	schemaVersion: "shipbysunday-worker-license.v1";
	status: "active";
};

type WorkerActivationStartResponse = {
	deviceCode: string;
	expiresAt: number;
	intervalMs: number;
	userCode: string;
	verificationUrl: string;
	verificationUrlComplete?: string;
};

type WorkerActivationPollResponse =
	| { status: "pending" }
	| { reason: string; status: "denied" | "expired" }
	| { license: WorkerLicenseFile; status: "approved" };

type WorkerLicenseActivationResult =
	| { status: "activated" }
	| { reason: string; status: "blocked" | "failed" };

type ApplyResult = {
	createdRefs: string[];
	changedRefs: string[];
};

type RootPackageManager = "bun" | "npm" | "pnpm" | "yarn";

type ManagedFileTemplate = {
	content: string;
	executable?: boolean;
	managedSection?: boolean;
	preserveIfExists?: boolean;
	targetRef: string;
};

const INSTALL_REPORT_REF = "docs/worker/install-report.md";
const ROOT_AGENT_START = "<!-- shipbysunday-worker:start -->";
const ROOT_AGENT_END = "<!-- shipbysunday-worker:end -->";
const STARTER_PROGRAM_ID = "worker-foundations-adoption";
const STARTER_PROGRAM_ROOT =
	"docs/programs/active/2026-05-08-worker-foundations-adoption";
const STARTER_CHILD_PLAN_REF =
	"docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md";
const WORKER_MANIFEST_MANAGED_REFS = [
	"scripts/run-worker.sh",
	"apps/worker/package.json",
	"apps/worker/bun.lock",
	"apps/worker/worker-manifest.json",
	"apps/worker/src/worker-cli.ts",
	"apps/worker/tests/smoke.test.ts",
] as const;
const DEFAULT_WORKER_LICENSE_API_BASE_URL = "https://www.man-meets-ai.com";
const WORKER_LICENSE_ACTIVATION_START_PATH = "/api/worker/license/device/start";
const WORKER_LICENSE_ACTIVATION_POLL_PATH = "/api/worker/license/device/poll";
const MIN_ACTIVATION_POLL_INTERVAL_MS = 1_000;
const MAX_ACTIVATION_POLL_INTERVAL_MS = 10_000;
const DEFAULT_ACTIVATION_TIMEOUT_MS = 5 * 60_000;
const WORKER_MANAGED_BUN_VERSION = "1.3.5";
const WORKER_MANAGED_BUN_SHA256_BY_ASSET: Record<string, string> = {
	"bun-darwin-aarch64.zip":
		"db17588a4aea8804856825d4bead3f05e1f37276ca606f37e369b4f72f35d3fb",
	"bun-darwin-x64.zip":
		"f5ffc03030fe527a86295fb5852bb08c5e99b707560011d1d509ab028902bf29",
	"bun-linux-aarch64.zip":
		"ed01000f85bd97785228ad2845dc92a1860b8054856826d7317690ac8f8ee74b",
	"bun-linux-x64.zip":
		"7051d86a924aefea3e0b96213b5fd8f79c0793f9cae6534233e627e5c3db4669",
	"bun-windows-x64.zip":
		"922cffdd5143cd118c6ccec6a61dfcf5d69e0068b048ea00f0a0615016530082",
};

export async function runWorkerFoundationsInstall({
	options,
	env = process.env,
	now = Date.now(),
}: {
	options: WorkerInstallOptions;
	env?: NodeJS.ProcessEnv;
	now?: number;
}): Promise<WorkerInstallResult> {
	let repositoryRoot: string;
	try {
		repositoryRoot = (
			await resolveRepositoryRoot({ explicitRoot: options.repoPath })
		).repositoryRoot;
	} catch (error) {
		return blockedResult({
			summary: error instanceof Error ? error.message : String(error),
			plan: buildBlockedPlan({
				packageManager: "npm",
				blockers: [
					{
						blockerId: "git-repository",
						reason: "Shipbysunday install requires a Git repository.",
					},
				],
			}),
			options,
		});
	}

	const context: WorkerInstallContext = {
		env,
		now,
		options,
		repositoryRoot,
		workerHome: resolveWorkerHome(env),
		runId: `worker-install-${now}`,
	};
	let inspection = await inspectTargetRepository(context);
	const activationBlockers = inspection.blockers.filter(
		(blocker) => blocker.blockerId !== "license",
	);
	if (
		!options.dryRun &&
		shouldAttemptInteractiveLicenseActivation(context, inspection) &&
		activationBlockers.length === 0
	) {
		const activationResult = await activateWorkerLicense(context);
		if (activationResult.status !== "activated") {
			const plan = buildInstallPlan({
				...inspection,
				blockers: [
					...activationBlockers,
					{
						blockerId: "license",
						reason: activationResult.reason,
					},
				],
			});
			return finishResult({
				outcome: activationResult.status === "blocked" ? "blocked" : "failed",
				exitCode: activationResult.status === "blocked" ? 2 : 1,
				summary: "Worker license activation did not complete.",
				context,
				plan,
				proof: [],
				createdRefs: [],
				changedRefs: [],
				branch: null,
				commit: null,
				localProofRef: null,
				reportRef: null,
				kickoff: buildSkippedKickoff("blocked"),
			});
		}
		inspection = await inspectTargetRepository(context);
	}
	const plan = buildInstallPlan(inspection);
	if (options.dryRun) {
		return finishResult({
			outcome: plan.blockers.length > 0 ? "blocked" : "ready",
			exitCode: plan.blockers.length > 0 ? 2 : 0,
			summary:
				plan.blockers.length > 0
					? "Worker Foundations install is blocked."
					: "Worker Foundations install is ready.",
			context,
			plan,
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("dry-run"),
		});
	}

	if (options.json && !options.noKickoff) {
		return finishResult({
			outcome: "blocked",
			exitCode: 2,
			summary: "JSON install requires --no-kickoff.",
			context,
			plan: addPlanBlocker(plan, {
				blockerId: "json-kickoff",
				reason:
					"JSON install requires --no-kickoff so stdout remains one machine-readable object.",
			}),
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("blocked"),
		});
	}

	if (plan.blockers.length > 0) {
		return finishResult({
			outcome: "blocked",
			exitCode: 2,
			summary: "Worker Foundations install is blocked.",
			context,
			plan,
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("blocked"),
		});
	}

	if (!options.yes && (options.json || !process.stdin.isTTY)) {
		return finishResult({
			outcome: "blocked",
			exitCode: 2,
			summary: "Noninteractive install requires --yes.",
			context,
			plan: addPlanBlocker(plan, {
				blockerId: "confirmation",
				reason: options.json
					? "JSON install requires --yes so stdout remains one machine-readable object."
					: "Noninteractive install requires --yes.",
			}),
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("blocked"),
		});
	}

	if (!options.yes) {
		const confirmed = await confirmInstall({ options, plan });
		if (!confirmed) {
			return finishResult({
				outcome: "cancelled",
				exitCode: 130,
				summary: "Worker Foundations install cancelled.",
				context,
				plan,
				proof: [],
				createdRefs: [],
				changedRefs: [],
				branch: null,
				commit: null,
				localProofRef: null,
				reportRef: null,
				kickoff: buildSkippedKickoff("cancelled"),
			});
		}
	}

	try {
		await ensureWorkerBunToolchain(context, inspection.bunToolchain);
	} catch (error) {
		return finishResult({
			outcome: "failed",
			exitCode: 1,
			summary:
				error instanceof Error
					? error.message
					: "Worker-managed Bun toolchain could not be prepared.",
			context,
			plan,
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("failed"),
		});
	}

	const branchResult = await prepareInstallBranch(context);
	if (branchResult.status === "blocked") {
		return finishResult({
			outcome: "blocked",
			exitCode: 2,
			summary: branchResult.reason,
			context,
			plan: addPlanBlocker(plan, {
				blockerId: "install-branch",
				reason: branchResult.reason,
			}),
			proof: [],
			createdRefs: [],
			changedRefs: [],
			branch: null,
			commit: null,
			localProofRef: null,
			reportRef: null,
			kickoff: buildSkippedKickoff("blocked"),
		});
	}

	let codexConfigBackupPath: string | null = null;
	try {
		if (!options.noKickoff) {
			const codexConfigPatch = await applyShipbysundayWorkerCodexConfigPatch({
				env,
			});
			codexConfigBackupPath = codexConfigPatch.backupPath;
		}

		const applyResult = await applyWorkerFoundations(
			context,
			inspection.packageManager,
		);
		const childPlanExistedBeforeDogfood = existsSync(
			path.join(context.repositoryRoot, STARTER_CHILD_PLAN_REF),
		);
		const dogfoodResult = await runDogfoodChildPlan(
			context,
			inspection.packageManager,
		);
		const dogfoodCreatedRefs = childPlanExistedBeforeDogfood
			? []
			: [STARTER_CHILD_PLAN_REF];
		if (!dogfoodResult.succeeded) {
			const proof = [
				{ command: dogfoodResult.command, status: "failed" as const },
			];
			const kickoff = buildSkippedKickoff("failed");
			await rollbackWorkerCodexConfig({
				env,
				backupPath: codexConfigBackupPath,
			});
			await writeTrackedInstallReport({
				context,
				result: buildReport({
					context,
					outcome: "failed",
					branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
					commit: null,
					plan,
					proof,
					createdRefs: applyResult.createdRefs,
					changedRefs: applyResult.changedRefs,
					localProofRef: null,
					reportRef: INSTALL_REPORT_REF,
					kickoff,
				}),
			});
			return finishResult({
				outcome: "failed",
				exitCode: 1,
				summary: "Worker Foundations dogfood proof failed.",
				context,
				plan,
				proof,
				createdRefs: applyResult.createdRefs,
				changedRefs: [...applyResult.changedRefs, INSTALL_REPORT_REF],
				branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
				commit: null,
				localProofRef: null,
				reportRef: INSTALL_REPORT_REF,
				kickoff,
			});
		}

		const proof = await runProofCommands(context, inspection.packageManager);
		const proofFailed = proof.some((status) => status.status === "failed");
		const localProofRef = await writeLocalProof({ context, plan, proof });
		const installedRefs = [...applyResult.createdRefs, ...dogfoodCreatedRefs];
		if (proofFailed) {
			const kickoff = buildSkippedKickoff("failed");
			await rollbackWorkerCodexConfig({
				env,
				backupPath: codexConfigBackupPath,
			});
			await writeTrackedInstallReport({
				context,
				result: buildReport({
					context,
					outcome: "failed",
					branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
					commit: null,
					plan,
					proof,
					createdRefs: installedRefs,
					changedRefs: applyResult.changedRefs,
					localProofRef,
					reportRef: INSTALL_REPORT_REF,
					kickoff,
				}),
			});
			return finishResult({
				outcome: "failed",
				exitCode: 1,
				summary: "Worker Foundations proof failed.",
				context,
				plan,
				proof,
				createdRefs: installedRefs,
				changedRefs: [...applyResult.changedRefs, INSTALL_REPORT_REF],
				branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
				commit: null,
				localProofRef,
				reportRef: INSTALL_REPORT_REF,
				kickoff,
			});
		}

		let commit: string | null = null;
		let kickoff = context.options.noKickoff
			? buildSkippedKickoff("disabled")
			: buildSkippedKickoff("post-commit");
		await writeTrackedInstallReport({
			context,
			result: buildReport({
				context,
				outcome: "installed",
				branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
				commit: null,
				plan,
				proof,
				createdRefs: installedRefs,
				changedRefs: applyResult.changedRefs,
				localProofRef,
				reportRef: INSTALL_REPORT_REF,
				kickoff,
			}),
		});
		if (!options.noCommit) {
			commit = await commitInstallChanges({
				context,
				touchedRefs: [
					...installedRefs,
					...applyResult.changedRefs,
					INSTALL_REPORT_REF,
				],
			});
		}

		if (!context.options.noKickoff) {
			kickoff = await maybeRunKickoff(context);
		}
		const outcome = kickoff.status === "blocked" ? "failed" : "installed";
		const exitCode = outcome === "failed" ? 1 : 0;
		if (outcome === "failed") {
			await rollbackWorkerCodexConfig({
				env,
				backupPath: codexConfigBackupPath,
			});
		}
		await writeTrackedInstallReport({
			context,
			result: buildReport({
				context,
				outcome,
				branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
				commit,
				plan,
				proof,
				createdRefs: installedRefs,
				changedRefs: applyResult.changedRefs,
				localProofRef,
				reportRef: INSTALL_REPORT_REF,
				kickoff,
			}),
		});
		if (commit) {
			commit = await amendTrackedInstallReport(context);
		} else if (!options.noCommit) {
			commit = await commitInstallChanges({
				context,
				touchedRefs: [INSTALL_REPORT_REF],
			});
		}

		const report = buildReport({
			context,
			outcome,
			branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
			commit,
			plan,
			proof,
			createdRefs: installedRefs,
			changedRefs: applyResult.changedRefs,
			localProofRef,
			reportRef: INSTALL_REPORT_REF,
			kickoff,
		});

		return finishResult({
			outcome,
			exitCode,
			summary:
				outcome === "failed"
					? "Worker Foundations kickoff failed."
					: "Worker Foundations installed.",
			context,
			plan,
			proof,
			createdRefs: report.createdRefs,
			changedRefs: [...report.changedRefs, INSTALL_REPORT_REF],
			branch: WORKER_FOUNDATIONS_INSTALL_BRANCH,
			commit,
			localProofRef,
			reportRef: INSTALL_REPORT_REF,
			kickoff,
		});
	} catch (error) {
		await rollbackWorkerCodexConfig({ env, backupPath: codexConfigBackupPath });
		throw error;
	}
}

function resolveWorkerHome(env: NodeJS.ProcessEnv) {
	return path.resolve(
		env[WORKER_MACHINE_HOME_ENV_VAR] ?? path.join(os.homedir(), ".worker"),
	);
}

async function inspectTargetRepository(
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

	const bunToolchain = await inspectWorkerBunToolchain(context);
	if (bunToolchain.status === "blocked") {
		blockers.push({
			blockerId: "worker-bun-toolchain",
			reason:
				"Worker-managed Bun toolchain cannot be prepared on this machine.",
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
		bunToolchain,
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

async function inspectWorkerLicense(context: WorkerInstallContext) {
	const licensePath = path.join(context.workerHome, "license.json");
	if (!existsSync(licensePath)) {
		return {
			status: "missing",
			reason:
				"License activation is missing. Run shipbysunday install interactively after signing in.",
		} satisfies WorkerLicenseStatus;
	}
	try {
		const validation = validateWorkerLicenseFile(
			await readFile(licensePath, "utf8"),
		);
		if (!validation.valid) {
			return {
				status: "invalid",
				reason: validation.reason,
			} satisfies WorkerLicenseStatus;
		}
		const expiresAtMs = validation.license.expires_at
			? Date.parse(validation.license.expires_at)
			: null;
		if (expiresAtMs !== null && expiresAtMs <= context.now) {
			return {
				status: "invalid",
				reason: "License activation is invalid because it has expired.",
			} satisfies WorkerLicenseStatus;
		}
		return { status: "active" } satisfies WorkerLicenseStatus;
	} catch {
		return {
			status: "invalid",
			reason:
				"License activation is invalid because license.json cannot be read.",
		} satisfies WorkerLicenseStatus;
	}
}

function validateWorkerLicenseFile(
	text: string,
):
	| { license: WorkerLicenseFile; valid: true }
	| { reason: string; valid: false } {
	const parsed = parseJsonObject(text);
	if (!parsed) {
		return {
			valid: false,
			reason:
				"License activation is invalid because license.json is not a JSON object.",
		};
	}
	if (parsed.schemaVersion !== "shipbysunday-worker-license.v1") {
		return {
			valid: false,
			reason:
				"License activation is invalid because the schema version is unsupported.",
		};
	}
	if (parsed.status !== "active") {
		return {
			valid: false,
			reason: "License activation is invalid because it is not active.",
		};
	}
	if (
		typeof parsed.machineCredential !== "string" ||
		parsed.machineCredential.trim() === ""
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the machine credential is missing.",
		};
	}
	for (const key of ["issued_at", "expires_at"] as const) {
		if (parsed[key] === undefined) {
			continue;
		}
		if (typeof parsed[key] !== "string") {
			return {
				valid: false,
				reason: `License activation is invalid because ${key} must be an ISO timestamp.`,
			};
		}
		const timestamp = Date.parse(parsed[key]);
		if (!Number.isFinite(timestamp)) {
			return {
				valid: false,
				reason: `License activation is invalid because ${key} is not a valid timestamp.`,
			};
		}
	}
	return {
		valid: true,
		license: {
			schemaVersion: parsed.schemaVersion,
			status: parsed.status,
			machineCredential: parsed.machineCredential,
			...(typeof parsed.accountId === "string"
				? { accountId: parsed.accountId }
				: {}),
			...(typeof parsed.machineId === "string"
				? { machineId: parsed.machineId }
				: {}),
			...(typeof parsed.issued_at === "string"
				? { issued_at: parsed.issued_at }
				: {}),
			...(typeof parsed.expires_at === "string"
				? { expires_at: parsed.expires_at }
				: {}),
		},
	};
}

function shouldAttemptInteractiveLicenseActivation(
	context: WorkerInstallContext,
	inspection: TargetRepoInspection,
) {
	return (
		inspection.licenseStatus.status === "missing" &&
		!context.options.yes &&
		!context.options.json &&
		Boolean(process.stdin.isTTY)
	);
}

async function activateWorkerLicense(
	context: WorkerInstallContext,
): Promise<WorkerLicenseActivationResult> {
	let startResponse: WorkerActivationStartResponse;
	try {
		startResponse = await startWorkerLicenseActivation(context);
	} catch (error) {
		return {
			status: "failed",
			reason:
				error instanceof Error
					? error.message
					: "Worker license activation could not start.",
		};
	}

	const browserUrl =
		startResponse.verificationUrlComplete ?? startResponse.verificationUrl;
	process.stderr.write(
		[
			"Shipbysunday Worker license activation is required before install.",
			`Open: ${browserUrl}`,
			`Code: ${startResponse.userCode}`,
			"",
		].join("\n"),
	);
	openActivationUrl(context, browserUrl);

	const pollResult = await pollWorkerLicenseActivation({
		context,
		deviceCode: startResponse.deviceCode,
		expiresAt: startResponse.expiresAt,
		intervalMs: startResponse.intervalMs,
	});
	if (pollResult.status !== "approved") {
		return {
			status: pollResult.status === "pending" ? "failed" : "blocked",
			reason:
				pollResult.status === "pending"
					? "Worker license activation timed out before approval."
					: pollResult.reason,
		};
	}

	const serializedLicense = `${JSON.stringify(pollResult.license, null, "\t")}\n`;
	const validation = validateWorkerLicenseFile(serializedLicense);
	if (!validation.valid) {
		return {
			status: "failed",
			reason: validation.reason,
		};
	}
	await mkdir(context.workerHome, { recursive: true });
	await writeFile(
		path.join(context.workerHome, "license.json"),
		serializedLicense,
		{ mode: 0o600 },
	);
	process.stderr.write("Worker license activated on this machine.\n");
	return { status: "activated" };
}

async function startWorkerLicenseActivation(
	context: WorkerInstallContext,
): Promise<WorkerActivationStartResponse> {
	const response = await postWorkerActivationJson({
		context,
		pathname: WORKER_LICENSE_ACTIVATION_START_PATH,
		body: {
			activationKind: "worker-foundations-install",
			installerVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
			workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		},
	});
	const parsed = parseActivationStartResponse(response);
	if (!parsed) {
		throw new Error("Worker license activation start response was invalid.");
	}
	return parsed;
}

async function pollWorkerLicenseActivation({
	context,
	deviceCode,
	expiresAt,
	intervalMs,
}: {
	context: WorkerInstallContext;
	deviceCode: string;
	expiresAt: number;
	intervalMs: number;
}): Promise<WorkerActivationPollResponse> {
	const deadline = Math.min(
		expiresAt,
		context.now + DEFAULT_ACTIVATION_TIMEOUT_MS,
	);
	let nextDelayMs = intervalMs;
	while (Date.now() < deadline) {
		await delay(nextDelayMs);
		const response = await postWorkerActivationJson({
			context,
			pathname: WORKER_LICENSE_ACTIVATION_POLL_PATH,
			body: { deviceCode },
		});
		const parsed = parseActivationPollResponse(response);
		if (!parsed) {
			return {
				status: "denied",
				reason: "Worker license activation poll response was invalid.",
			};
		}
		if (parsed.status !== "pending") {
			return parsed;
		}
		nextDelayMs = Math.min(nextDelayMs + 500, MAX_ACTIVATION_POLL_INTERVAL_MS);
	}
	return { status: "pending" };
}

async function postWorkerActivationJson({
	context,
	pathname,
	body,
}: {
	context: WorkerInstallContext;
	pathname: string;
	body: JsonObject;
}) {
	const response = await fetch(
		new URL(pathname, resolveWorkerLicenseApiBaseUrl(context.env)),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		},
	);
	if (!response.ok) {
		throw new Error(
			`Worker license activation failed with HTTP ${response.status}.`,
		);
	}
	return (await response.json()) as JsonValue;
}

function parseActivationStartResponse(
	value: JsonValue,
): WorkerActivationStartResponse | null {
	if (!isJsonObject(value)) {
		return null;
	}
	const deviceCode = readStringValue(value, "deviceCode");
	const userCode = readStringValue(value, "userCode");
	const verificationUrl = readStringValue(value, "verificationUrl");
	const verificationUrlComplete = readOptionalStringValue(
		value,
		"verificationUrlComplete",
	);
	const expiresAtValue = value.expiresAt;
	const expiresAt =
		typeof expiresAtValue === "string"
			? Date.parse(expiresAtValue)
			: typeof expiresAtValue === "number"
				? expiresAtValue
				: Number.NaN;
	const intervalSeconds =
		typeof value.intervalSeconds === "number" ? value.intervalSeconds : 2;
	if (
		!deviceCode ||
		!userCode ||
		!verificationUrl ||
		!Number.isFinite(expiresAt)
	) {
		return null;
	}
	return {
		deviceCode,
		userCode,
		verificationUrl,
		...(verificationUrlComplete ? { verificationUrlComplete } : {}),
		expiresAt,
		intervalMs: Math.min(
			Math.max(intervalSeconds * 1_000, MIN_ACTIVATION_POLL_INTERVAL_MS),
			MAX_ACTIVATION_POLL_INTERVAL_MS,
		),
	};
}

function parseActivationPollResponse(
	value: JsonValue,
): WorkerActivationPollResponse | null {
	if (!isJsonObject(value)) {
		return null;
	}
	if (value.status === "pending") {
		return { status: "pending" };
	}
	if (value.status === "denied" || value.status === "expired") {
		return {
			status: value.status,
			reason: formatActivationPollBlockerReason(value.status),
		};
	}
	if (value.status === "approved" && isJsonObject(value.license)) {
		const licenseText = `${JSON.stringify(value.license)}\n`;
		const validation = validateWorkerLicenseFile(licenseText);
		if (!validation.valid) {
			return null;
		}
		return { status: "approved", license: validation.license };
	}
	return null;
}

function formatActivationPollBlockerReason(
	status: Extract<WorkerActivationPollResponse["status"], "denied" | "expired">,
) {
	return status === "denied"
		? "Worker license activation was denied."
		: "Worker license activation expired before approval.";
}

function readStringValue(value: JsonObject, key: string) {
	const item = value[key];
	return typeof item === "string" && item.trim() !== "" ? item : null;
}

function readOptionalStringValue(value: JsonObject, key: string) {
	const item = value[key];
	return typeof item === "string" && item.trim() !== "" ? item : null;
}

function resolveWorkerLicenseApiBaseUrl(env: NodeJS.ProcessEnv) {
	return new URL(
		env[WORKER_LICENSE_API_BASE_URL_ENV_VAR] ??
			DEFAULT_WORKER_LICENSE_API_BASE_URL,
	).toString();
}

function openActivationUrl(
	context: WorkerInstallContext,
	activationUrl: string,
) {
	if (
		context.env[WORKER_LICENSE_OPEN_BROWSER_ENV_VAR] === "0" ||
		context.env.CI === "true"
	) {
		return;
	}
	const opener =
		process.platform === "darwin"
			? { args: [activationUrl], command: "open" }
			: process.platform === "win32"
				? { args: ["/c", "start", "", activationUrl], command: "cmd" }
				: { args: [activationUrl], command: "xdg-open" };
	spawnSync(opener.command, opener.args, {
		stdio: "ignore",
		env: buildCodexKickoffEnv(context),
	});
}

async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

async function inspectWorkerBunToolchain(
	context: WorkerInstallContext,
): Promise<WorkerBunToolchainPlan> {
	const managedBunPath = resolveManagedBunPath(context);
	if (
		existsSync(managedBunPath) &&
		(await commandReportsExpectedBunVersion(managedBunPath, context.env))
	) {
		return {
			runtime: "bun",
			status: "managed",
			origin: "worker-managed",
			targetRef: "worker-home/toolchains/bun/bin/bun",
		};
	}
	if (await commandReportsExpectedBunVersion("bun", context.env)) {
		return {
			runtime: "bun",
			status: "available",
			origin: "path",
			targetRef: "worker-home/toolchains/bun/bin/bun",
		};
	}
	const candidate = await resolveProvisionableBunCandidate(context);
	if (candidate) {
		return {
			runtime: "bun",
			status: "provisionable",
			origin: candidate.origin,
			targetRef: "worker-home/toolchains/bun/bin/bun",
		};
	}
	return {
		runtime: "bun",
		status: "blocked",
		origin: "missing",
		targetRef: "worker-home/toolchains/bun/bin/bun",
	};
}

type ProvisionableBunCandidate = {
	origin: "current-runtime" | "download" | "explicit-env";
} & (
	| {
			absolutePath: string;
			origin: "current-runtime" | "explicit-env";
	  }
	| {
			archiveAssetName: string;
			downloadUrl: string;
			expectedSha256: string;
			origin: "download";
	  }
);

async function resolveProvisionableBunCandidate(
	context: WorkerInstallContext,
): Promise<ProvisionableBunCandidate | null> {
	const explicitBunPath = context.env[WORKER_BUN_EXECUTABLE_ENV_VAR];
	if (
		explicitBunPath &&
		(await commandReportsExpectedBunVersion(explicitBunPath, context.env))
	) {
		return { absolutePath: explicitBunPath, origin: "explicit-env" };
	}

	const explicitDownloadUrl = resolveExplicitBunDownloadUrl(context.env);
	if (explicitDownloadUrl) {
		const integrity = resolveBunDownloadIntegrity({
			env: context.env,
			downloadUrl: explicitDownloadUrl,
			source: "explicit",
		});
		if (integrity) {
			return {
				...integrity,
				downloadUrl: explicitDownloadUrl,
				origin: "download",
			};
		}
		return null;
	}

	const processVersions = process.versions as NodeJS.ProcessVersions & {
		bun?: string;
	};
	if (
		processVersions.bun &&
		(await commandReportsExpectedBunVersion(process.execPath, context.env))
	) {
		return { absolutePath: process.execPath, origin: "current-runtime" };
	}
	const defaultDownloadUrl = resolveDefaultBunDownloadUrl();
	if (defaultDownloadUrl) {
		const integrity = resolveBunDownloadIntegrity({
			env: context.env,
			downloadUrl: defaultDownloadUrl,
			source: "default",
		});
		if (integrity) {
			return {
				...integrity,
				downloadUrl: defaultDownloadUrl,
				origin: "download",
			};
		}
	}
	return null;
}

function resolveExplicitBunDownloadUrl(env: NodeJS.ProcessEnv) {
	const value = env[WORKER_BUN_DOWNLOAD_URL_ENV_VAR];
	if (!value) {
		return null;
	}
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

function resolveBunDownloadIntegrity({
	env,
	downloadUrl,
	source,
}: {
	env: NodeJS.ProcessEnv;
	downloadUrl: string;
	source: "default" | "explicit";
}) {
	const archiveAssetName = resolveBunReleaseAssetName();
	if (!archiveAssetName) {
		return null;
	}
	const overrideSha256 = normalizeSha256(
		env[WORKER_BUN_DOWNLOAD_SHA256_ENV_VAR],
	);
	if (source === "explicit" && overrideSha256) {
		return { archiveAssetName, expectedSha256: overrideSha256 };
	}
	const knownAssetName =
		source === "default"
			? archiveAssetName
			: readBunAssetNameFromUrl(downloadUrl);
	if (knownAssetName !== archiveAssetName) {
		return null;
	}
	const expectedSha256 = WORKER_MANAGED_BUN_SHA256_BY_ASSET[archiveAssetName];
	return expectedSha256 ? { archiveAssetName, expectedSha256 } : null;
}

function normalizeSha256(value: string | undefined) {
	const normalized = value?.trim().toLowerCase();
	return normalized && /^[a-f0-9]{64}$/.test(normalized) ? normalized : null;
}

function readBunAssetNameFromUrl(downloadUrl: string) {
	try {
		return path.posix.basename(new URL(downloadUrl).pathname);
	} catch {
		return null;
	}
}

function resolveDefaultBunDownloadUrl() {
	const assetName = resolveBunReleaseAssetName();
	if (!assetName) {
		return null;
	}
	return `https://github.com/oven-sh/bun/releases/download/bun-v${WORKER_MANAGED_BUN_VERSION}/${assetName}`;
}

function resolveBunReleaseAssetName() {
	if (process.platform === "darwin") {
		if (process.arch === "arm64") return "bun-darwin-aarch64.zip";
		if (process.arch === "x64") return "bun-darwin-x64.zip";
		return null;
	}
	if (process.platform === "linux") {
		if (process.arch === "arm64") return "bun-linux-aarch64.zip";
		if (process.arch === "x64") return "bun-linux-x64.zip";
		return null;
	}
	if (process.platform === "win32") {
		if (process.arch === "x64") return "bun-windows-x64.zip";
		return null;
	}
	return null;
}

function buildInstallPlan(inspection: TargetRepoInspection): WorkerInstallPlan {
	const operations: WorkerInstallOperation[] = [];
	operations.push(buildBunToolchainOperation(inspection.bunToolchain));
	for (const scriptName of WORKER_FOUNDATIONS_ROOT_SCRIPTS) {
		operations.push(
			buildPackageScriptOperation({
				scriptName,
				packageJson: inspection.packageJson,
				packageJsonExists: inspection.packageJsonExists,
			}),
		);
	}
	for (const targetRef of requiredManagedFileRefs(inspection.packageManager)) {
		operations.push({
			operationId: `file:${targetRef}`,
			surface: "file",
			targetRef,
			status: "planned",
			reason: "Worker-managed file will be created or refreshed safely.",
		});
	}
	for (const blocker of inspection.blockers) {
		operations.push({
			operationId: `blocked:${blocker.blockerId}`,
			surface: "preflight",
			targetRef: blocker.targetRef ?? "preflight",
			status: "blocked",
			reason: blocker.reason,
		});
	}

	return {
		schemaVersion: "worker-foundations-install-plan.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workflowVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		packageManager: inspection.packageManager,
		toolchain: inspection.bunToolchain,
		operations,
		blockers: [
			...inspection.blockers,
			...operations
				.filter((operation) => operation.status === "blocked")
				.filter(
					(operation) =>
						!inspection.blockers.some(
							(blocker) =>
								`blocked:${blocker.blockerId}` === operation.operationId,
						),
				)
				.map((operation) => ({
					blockerId: operation.operationId,
					targetRef: operation.targetRef,
					reason: operation.reason,
				})),
		],
		proofCommands: WORKER_FOUNDATIONS_PROOF_SCRIPTS.map(
			(scriptName) => `${inspection.packageManager} run ${scriptName}`,
		),
		privacyBoundary: buildPrivacyBoundary(),
	};
}

function addPlanBlocker(
	plan: WorkerInstallPlan,
	blocker: WorkerInstallBlocker,
): WorkerInstallPlan {
	return {
		...plan,
		blockers: [...plan.blockers, blocker],
		operations: [
			...plan.operations,
			{
				operationId: `blocked:${blocker.blockerId}`,
				surface: "preflight",
				targetRef: blocker.targetRef ?? "preflight",
				status: "blocked",
				reason: blocker.reason,
			},
		],
	};
}

function buildBunToolchainOperation(
	toolchain: WorkerBunToolchainPlan,
): WorkerInstallOperation {
	if (toolchain.status === "available" || toolchain.status === "managed") {
		return {
			operationId: "toolchain:bun",
			surface: "toolchain",
			targetRef: toolchain.targetRef,
			status: "keep",
			reason:
				toolchain.status === "managed"
					? "Worker-managed Bun toolchain is already available."
					: "Compatible Bun is available on PATH.",
		};
	}
	if (toolchain.status === "provisionable") {
		return {
			operationId: "toolchain:bun",
			surface: "toolchain",
			targetRef: toolchain.targetRef,
			status: "planned",
			reason:
				"Worker-managed Bun toolchain will be prepared before repo writes.",
		};
	}
	return {
		operationId: "toolchain:bun",
		surface: "toolchain",
		targetRef: toolchain.targetRef,
		status: "blocked",
		reason: "Worker-managed Bun toolchain cannot be prepared on this machine.",
	};
}

function buildPackageScriptOperation({
	scriptName,
	packageJson,
	packageJsonExists,
}: {
	scriptName: WorkerFoundationsRootScript;
	packageJson: JsonObject;
	packageJsonExists: boolean;
}): WorkerInstallOperation {
	if (!packageJsonExists) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "add",
			reason:
				"Root package.json will be created with Bun defaults and this Worker command script.",
		};
	}
	const scripts = packageJson.scripts;
	if (scripts !== undefined && !isJsonObject(scripts)) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: "package.json#scripts",
			status: "blocked",
			reason: "Root package.json scripts field must be an object.",
		};
	}
	const currentScript = isJsonObject(scripts) ? scripts[scriptName] : undefined;
	if (currentScript === undefined) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "add",
			reason: "Missing Worker command script will be added.",
		};
	}
	if (typeof currentScript !== "string") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "blocked",
			reason: "Existing same-name package script is not a string.",
		};
	}
	const recognition = recognizeWorkerScriptCommand(scriptName, currentScript);
	if (recognition === "keep") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "keep",
			reason: "Existing Worker command script is recognized.",
		};
	}
	if (recognition === "update-managed") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "update-managed",
			reason: "Existing legacy Worker runtime script will be updated.",
		};
	}
	return {
		operationId: `package-script:${scriptName}`,
		surface: "package-script",
		targetRef: `package.json#scripts.${scriptName}`,
		status: "blocked",
		reason:
			"Existing same-name package script is not recognized as Worker-managed.",
	};
}

async function prepareInstallBranch(
	context: WorkerInstallContext,
): Promise<{ status: "ready" } | { status: "blocked"; reason: string }> {
	if (
		(await readCurrentBranch(context.repositoryRoot)) ===
		WORKER_FOUNDATIONS_INSTALL_BRANCH
	) {
		return { status: "ready" };
	}
	if (!(await gitBranchExists(context.repositoryRoot))) {
		const createResult = await runGit(context.repositoryRoot, [
			"checkout",
			"-b",
			WORKER_FOUNDATIONS_INSTALL_BRANCH,
		]);
		return createResult.succeeded
			? { status: "ready" }
			: {
					status: "blocked",
					reason: "Could not create shipbysunday/install branch.",
				};
	}
	const ancestorResult = await runGit(context.repositoryRoot, [
		"merge-base",
		"--is-ancestor",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
		"HEAD",
	]);
	if (!ancestorResult.succeeded) {
		return {
			status: "blocked",
			reason:
				"Existing shipbysunday/install branch contains unmerged work. Review, merge, or delete it before rerunning.",
		};
	}
	const updateResult = await runGit(context.repositoryRoot, [
		"branch",
		"-f",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
		"HEAD",
	]);
	if (!updateResult.succeeded) {
		return {
			status: "blocked",
			reason: "Could not update shipbysunday/install branch.",
		};
	}
	const checkoutResult = await runGit(context.repositoryRoot, [
		"checkout",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
	]);
	if (!checkoutResult.succeeded) {
		return {
			status: "blocked",
			reason: "Could not check out shipbysunday/install branch.",
		};
	}
	return { status: "ready" };
}

async function ensureWorkerBunToolchain(
	context: WorkerInstallContext,
	toolchain: WorkerBunToolchainPlan,
) {
	if (toolchain.status !== "provisionable") {
		return;
	}
	const candidate = await resolveProvisionableBunCandidate(context);
	if (!candidate) {
		throw new Error("Worker-managed Bun toolchain is no longer provisionable.");
	}
	const managedBunPath = resolveManagedBunPath(context);
	await mkdir(path.dirname(managedBunPath), { recursive: true });
	if (candidate.origin === "download") {
		await installDownloadedBun({
			archiveAssetName: candidate.archiveAssetName,
			context,
			downloadUrl: candidate.downloadUrl,
			expectedSha256: candidate.expectedSha256,
			managedBunPath,
		});
	} else {
		await copyFile(candidate.absolutePath, managedBunPath);
	}
	await chmod(managedBunPath, 0o755);
	await assertExpectedBunVersion(
		managedBunPath,
		buildWorkerProcessEnv(context),
	);
}

async function installDownloadedBun({
	archiveAssetName,
	context,
	downloadUrl,
	expectedSha256,
	managedBunPath,
}: {
	archiveAssetName: string;
	context: WorkerInstallContext;
	downloadUrl: string;
	expectedSha256: string;
	managedBunPath: string;
}) {
	const downloadDirectory = await mkdtemp(
		path.join(os.tmpdir(), "shipbysunday-worker-bun-"),
	);
	try {
		const response = await fetch(downloadUrl);
		if (!response.ok) {
			throw new Error(
				`Worker-managed Bun download failed with HTTP ${response.status}.`,
			);
		}
		const payload = Buffer.from(await response.arrayBuffer());
		assertDownloadedBunIntegrity(payload, expectedSha256);
		if (shouldTreatBunDownloadAsZip(downloadUrl, response)) {
			await installBunFromZip({
				archiveBytes: payload,
				archiveAssetName,
				context,
				downloadDirectory,
				managedBunPath,
			});
			return;
		}
		await writeFile(managedBunPath, payload, { mode: 0o755 });
	} finally {
		await rm(downloadDirectory, { force: true, recursive: true });
	}
}

function shouldTreatBunDownloadAsZip(downloadUrl: string, response: Response) {
	const contentType = response.headers.get("content-type") ?? "";
	return downloadUrl.endsWith(".zip") || contentType.includes("zip");
}

function assertDownloadedBunIntegrity(payload: Buffer, expectedSha256: string) {
	const actualSha256 = createHash("sha256").update(payload).digest("hex");
	if (actualSha256 !== expectedSha256) {
		throw new Error("Worker-managed Bun download failed integrity validation.");
	}
}

async function installBunFromZip({
	archiveBytes,
	archiveAssetName,
	context,
	downloadDirectory,
	managedBunPath,
}: {
	archiveBytes: Buffer;
	archiveAssetName: string;
	context: WorkerInstallContext;
	downloadDirectory: string;
	managedBunPath: string;
}) {
	const archivePath = path.join(downloadDirectory, "bun.zip");
	const extractDirectory = path.join(downloadDirectory, "extract");
	const expectedBinaryRef = expectedBunArchiveBinaryRef(archiveAssetName);
	validateBunArchiveEntries({
		archiveBytes,
		expectedBinaryRef,
	});
	await mkdir(extractDirectory, { recursive: true });
	await writeFile(archivePath, archiveBytes);
	const unzipResult = await runBoundedProcess({
		command: "unzip",
		args: ["-q", archivePath, expectedBinaryRef, "-d", extractDirectory],
		env: context.env,
		timeoutMs: 30_000,
	});
	if (!unzipResult.succeeded) {
		throw new Error("Worker-managed Bun archive could not be extracted.");
	}
	const extractedBunPath = path.join(extractDirectory, expectedBinaryRef);
	if (!existsSync(extractedBunPath)) {
		throw new Error("Worker-managed Bun archive did not contain bun.");
	}
	await assertExtractedBunPath({
		extractDirectory,
		extractedBunPath,
	});
	await copyFile(extractedBunPath, managedBunPath);
}

function expectedBunArchiveBinaryRef(archiveAssetName: string) {
	const archiveRoot = archiveAssetName.replace(/\.zip$/u, "");
	const executableName = process.platform === "win32" ? "bun.exe" : "bun";
	return `${archiveRoot}/${executableName}`;
}

async function assertExtractedBunPath({
	extractDirectory,
	extractedBunPath,
}: {
	extractDirectory: string;
	extractedBunPath: string;
}) {
	const extractRoot = await realpath(extractDirectory);
	const extractedRealPath = await realpath(extractedBunPath);
	if (!isPathInsideDirectory(extractedRealPath, extractRoot)) {
		throw new Error("Worker-managed Bun archive escaped extraction root.");
	}
}

function validateBunArchiveEntries({
	archiveBytes,
	expectedBinaryRef,
}: {
	archiveBytes: Buffer;
	expectedBinaryRef: string;
}) {
	const expectedRootRef = `${expectedBinaryRef.split("/")[0]}/`;
	const entries = readZipCentralDirectoryEntries(archiveBytes);
	if (!entries.some((entry) => entry.name === expectedBinaryRef)) {
		throw new Error("Worker-managed Bun archive did not contain bun.");
	}
	for (const entry of entries) {
		const allowedEntry =
			entry.name === expectedRootRef || entry.name === expectedBinaryRef;
		if (
			!allowedEntry ||
			isUnsafeZipEntryName(entry.name) ||
			isZipEntrySymlink(entry)
		) {
			throw new Error("Worker-managed Bun archive contained unsafe entries.");
		}
	}
}

type ZipCentralDirectoryEntry = {
	externalAttributes: number;
	name: string;
	versionMadeBy: number;
};

function readZipCentralDirectoryEntries(
	archiveBytes: Buffer,
): ZipCentralDirectoryEntry[] {
	const eocdOffset = findZipEndOfCentralDirectoryOffset(archiveBytes);
	if (eocdOffset === null) {
		throw new Error("Worker-managed Bun archive was not a valid zip.");
	}
	const entryCount = archiveBytes.readUInt16LE(eocdOffset + 10);
	const centralDirectorySize = archiveBytes.readUInt32LE(eocdOffset + 12);
	const centralDirectoryOffset = archiveBytes.readUInt32LE(eocdOffset + 16);
	if (
		entryCount === 0xffff ||
		centralDirectorySize === 0xffffffff ||
		centralDirectoryOffset === 0xffffffff
	) {
		throw new Error(
			"Worker-managed Bun archive used unsupported zip64 metadata.",
		);
	}
	if (
		centralDirectoryOffset + centralDirectorySize > archiveBytes.length ||
		centralDirectoryOffset < 0
	) {
		throw new Error("Worker-managed Bun archive had invalid zip metadata.");
	}
	const entries: ZipCentralDirectoryEntry[] = [];
	let offset = centralDirectoryOffset;
	for (let index = 0; index < entryCount; index += 1) {
		if (
			offset + 46 > archiveBytes.length ||
			archiveBytes.readUInt32LE(offset) !== 0x02014b50
		) {
			throw new Error("Worker-managed Bun archive had invalid zip entries.");
		}
		const versionMadeBy = archiveBytes.readUInt16LE(offset + 4);
		const nameLength = archiveBytes.readUInt16LE(offset + 28);
		const extraLength = archiveBytes.readUInt16LE(offset + 30);
		const commentLength = archiveBytes.readUInt16LE(offset + 32);
		const externalAttributes = archiveBytes.readUInt32LE(offset + 38);
		const nameStart = offset + 46;
		const nameEnd = nameStart + nameLength;
		if (nameEnd > archiveBytes.length) {
			throw new Error(
				"Worker-managed Bun archive had invalid zip entry names.",
			);
		}
		entries.push({
			externalAttributes,
			name: archiveBytes.toString("utf8", nameStart, nameEnd),
			versionMadeBy,
		});
		offset = nameEnd + extraLength + commentLength;
	}
	return entries;
}

function findZipEndOfCentralDirectoryOffset(archiveBytes: Buffer) {
	const minimumOffset = Math.max(0, archiveBytes.length - 65_557);
	for (
		let offset = archiveBytes.length - 22;
		offset >= minimumOffset;
		offset -= 1
	) {
		if (archiveBytes.readUInt32LE(offset) === 0x06054b50) {
			return offset;
		}
	}
	return null;
}

function isUnsafeZipEntryName(name: string) {
	if (
		name.trim() === "" ||
		name.includes("\0") ||
		name.includes("\\") ||
		name.startsWith("/") ||
		/^[A-Za-z]:\//u.test(name)
	) {
		return true;
	}
	const normalized = path.posix.normalize(name);
	return (
		normalized === ".." ||
		normalized.startsWith("../") ||
		name.split("/").includes("..")
	);
}

function isZipEntrySymlink(entry: ZipCentralDirectoryEntry) {
	const sourceHost = entry.versionMadeBy >> 8;
	if (sourceHost !== 3) {
		return false;
	}
	const unixMode = (entry.externalAttributes >>> 16) & 0xffff;
	return (unixMode & 0o170000) === 0o120000;
}

function isPathInsideDirectory(candidatePath: string, directoryPath: string) {
	const relativePath = path.relative(directoryPath, candidatePath);
	return (
		relativePath === "" ||
		(!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
	);
}

async function applyWorkerFoundations(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
): Promise<ApplyResult> {
	const applyResult: ApplyResult = { createdRefs: [], changedRefs: [] };
	await writePackageJsonScripts(context, applyResult, packageManager);
	await writeManagedFileSet(context, applyResult, packageManager);
	await appendGitInfoExclude(context);
	return applyResult;
}

async function writePackageJsonScripts(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
	packageManager: RootPackageManager,
) {
	const packageJsonPath = path.join(context.repositoryRoot, "package.json");
	const packageJsonExists = existsSync(packageJsonPath);
	const packageJsonText = packageJsonExists
		? await readFile(packageJsonPath, "utf8")
		: "";
	const packageJson = packageJsonExists
		? parseJsonObject(packageJsonText)
		: defaultRootPackageJson();
	if (!packageJson || !isJsonObject(packageJson)) {
		throw new Error("Root package.json must parse before apply.");
	}
	if (
		packageManager === "bun" &&
		typeof packageJson.packageManager !== "string"
	) {
		packageJson.packageManager = `bun@${WORKER_MANAGED_BUN_VERSION}`;
	}
	const scripts = ensureJsonObjectProperty(packageJson, "scripts");
	for (const scriptName of WORKER_FOUNDATIONS_ROOT_SCRIPTS) {
		const currentScript = scripts[scriptName];
		const expectedScript = expectedScriptCommand(scriptName);
		if (currentScript === undefined) {
			scripts[scriptName] = expectedScript;
			continue;
		}
		if (typeof currentScript !== "string") {
			throw new Error(
				`Refusing to overwrite unrecognized package script: ${scriptName}`,
			);
		}
		const recognition = recognizeWorkerScriptCommand(scriptName, currentScript);
		if (recognition === "update-managed") {
			scripts[scriptName] = expectedScript;
			continue;
		}
		if (recognition !== "keep") {
			throw new Error(
				`Refusing to overwrite unrecognized package script: ${scriptName}`,
			);
		}
	}
	await writeFile(
		packageJsonPath,
		`${JSON.stringify(packageJson, null, detectJsonIndent(packageJsonText))}\n`,
	);
	if (packageJsonExists) {
		applyResult.changedRefs.push("package.json");
	} else {
		applyResult.createdRefs.push("package.json");
	}
}

async function writeManagedFileSet(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
	packageManager: RootPackageManager,
) {
	for (const file of buildManagedFiles(packageManager)) {
		if (file.managedSection) {
			await writeManagedSectionFile({
				context,
				applyResult,
				targetRef: file.targetRef,
				content: file.content,
			});
			continue;
		}
		await writeCreateOrManagedFile({
			context,
			applyResult,
			targetRef: file.targetRef,
			content: file.content,
			executable: file.executable,
			preserveIfExists: file.preserveIfExists,
		});
	}
	await chmod(
		path.join(context.repositoryRoot, "scripts/run-worker.sh"),
		0o755,
	);
}

async function findManagedFileBlockers(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const blockers: WorkerInstallBlocker[] = [];
	for (const file of buildManagedFiles(packageManager)) {
		const absolutePath = path.join(context.repositoryRoot, file.targetRef);
		if (!existsSync(absolutePath)) {
			continue;
		}
		if (file.managedSection) {
			if (hasIncompleteManagedBlock(await readFile(absolutePath, "utf8"))) {
				blockers.push({
					blockerId: `file-conflict:${file.targetRef}`,
					targetRef: file.targetRef,
					reason: `Existing ${file.targetRef} has incomplete Worker managed markers.`,
				});
			}
			continue;
		}
		if (file.preserveIfExists) {
			continue;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		const expectedContent = normalizeManagedContent(file.content);
		if (currentContent !== expectedContent) {
			blockers.push({
				blockerId: `file-conflict:${file.targetRef}`,
				targetRef: file.targetRef,
				reason: "Existing same-name file is not recognized as Worker-managed.",
			});
		}
	}
	const childPlanPath = path.join(
		context.repositoryRoot,
		STARTER_CHILD_PLAN_REF,
	);
	if (existsSync(childPlanPath)) {
		const currentContent = await readFile(childPlanPath, "utf8");
		if (!isRecognizedStarterChildPlan(currentContent)) {
			blockers.push({
				blockerId: `file-conflict:${STARTER_CHILD_PLAN_REF}`,
				targetRef: STARTER_CHILD_PLAN_REF,
				reason:
					"Existing starter child ExecPlan is not recognized as Worker-managed.",
			});
		}
	}
	return blockers;
}

async function writeManagedSectionFile({
	context,
	applyResult,
	targetRef,
	content,
}: {
	context: WorkerInstallContext;
	applyResult: ApplyResult;
	targetRef: string;
	content: string;
}) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	if (!existsSync(absolutePath)) {
		await mkdir(path.dirname(absolutePath), { recursive: true });
		await writeFile(absolutePath, normalizeManagedContent(content));
		applyResult.createdRefs.push(targetRef);
		return;
	}
	const currentContent = await readFile(absolutePath, "utf8");
	const nextContent = replaceOrAppendManagedBlock({
		currentContent,
		managedBlock: extractManagedBlock(content),
	});
	if (
		normalizeManagedContent(currentContent) !==
		normalizeManagedContent(nextContent)
	) {
		await writeFile(absolutePath, normalizeManagedContent(nextContent));
		applyResult.changedRefs.push(targetRef);
	}
}

async function writeCreateOrManagedFile({
	context,
	applyResult,
	targetRef,
	content,
	executable = false,
	preserveIfExists = false,
}: {
	context: WorkerInstallContext;
	applyResult: ApplyResult;
	targetRef: string;
	content: string;
	executable?: boolean;
	preserveIfExists?: boolean;
}) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	const normalizedContent = normalizeManagedContent(content);
	if (existsSync(absolutePath)) {
		if (preserveIfExists) {
			return;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		if (currentContent !== normalizedContent) {
			throw new Error(
				`Refusing to overwrite owner-authored file: ${targetRef}`,
			);
		}
		applyResult.changedRefs.push(targetRef);
		return;
	}
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, normalizedContent);
	if (executable) {
		await chmod(absolutePath, 0o755);
	}
	applyResult.createdRefs.push(targetRef);
}

async function appendGitInfoExclude(context: WorkerInstallContext) {
	const excludePath = path.join(
		context.repositoryRoot,
		".git",
		"info",
		"exclude",
	);
	const current = existsSync(excludePath)
		? await readFile(excludePath, "utf8")
		: "";
	const lines = current.split(/\r?\n/).map((line) => line.trim());
	if (!lines.includes(".worker/")) {
		await mkdir(path.dirname(excludePath), { recursive: true });
		await writeFile(
			excludePath,
			`${current.trimEnd()}${current.trim().length > 0 ? "\n" : ""}.worker/\n`,
		);
	}
}

async function runDogfoodChildPlan(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const childPlanPath = path.join(
		context.repositoryRoot,
		STARTER_CHILD_PLAN_REF,
	);
	if (existsSync(childPlanPath)) {
		const currentContent = await readFile(childPlanPath, "utf8");
		if (isRecognizedStarterChildPlan(currentContent)) {
			return {
				succeeded: true,
				stdout: "",
				stderr: "",
				timedOut: false,
				command: `${packageManager} run program:write-child-plan`,
			};
		}
	}
	return await runPackageScript({
		context,
		packageManager,
		scriptName: "program:write-child-plan",
		args: [
			"--program-id",
			STARTER_PROGRAM_ID,
			"--plan",
			STARTER_CHILD_PLAN_REF,
			"--title",
			"Continue Worker Foundations Adoption",
			"--summary",
			"Continue from the installed Worker Foundations operating system.",
		],
	});
}

async function runProofCommands(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const proof: WorkerProofCommandStatus[] = [];
	for (const scriptName of WORKER_FOUNDATIONS_PROOF_SCRIPTS) {
		const result = await runPackageScript({
			context,
			packageManager,
			scriptName,
			args: [],
		});
		proof.push({
			command: `${packageManager} run ${scriptName}`,
			status: result.succeeded ? "passed" : "failed",
		});
		if (!result.succeeded) {
			break;
		}
	}
	return proof;
}

async function runPackageScript({
	context,
	packageManager,
	scriptName,
	args,
}: {
	context: WorkerInstallContext;
	packageManager: RootPackageManager;
	scriptName: string;
	args: string[];
}) {
	const commandArgs = packageRunArgs({ packageManager, scriptName, args });
	const command =
		packageManager === "bun" ? resolveBunCommand(context) : packageManager;
	const result = await runBoundedProcess({
		command,
		args: commandArgs,
		cwd: context.repositoryRoot,
		env: buildWorkerProcessEnv(context),
		timeoutMs: 30_000,
	});
	return {
		...result,
		command: `${packageManager} ${commandArgs.join(" ")}`,
	};
}

function packageRunArgs({
	packageManager,
	scriptName,
	args,
}: {
	packageManager: RootPackageManager;
	scriptName: string;
	args: string[];
}) {
	if (packageManager === "npm") {
		return args.length > 0
			? ["run", scriptName, "--", ...args]
			: ["run", scriptName];
	}
	return ["run", scriptName, ...args];
}

async function writeLocalProof({
	context,
	plan,
	proof,
}: {
	context: WorkerInstallContext;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
}) {
	const proofRef = `.worker/runs/${context.runId}/install-proof.json`;
	const proofValue: JsonObject = {
		schemaVersion: "worker-foundations-install-proof.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		plan,
		proof,
		privacyBoundary: buildPrivacyBoundary(),
	};
	assertSyncSafeValue(proofValue, "worker install proof");
	await writeRepoFile(
		context,
		proofRef,
		`${JSON.stringify(proofValue, null, 2)}\n`,
	);
	return proofRef;
}

async function writeTrackedInstallReport({
	context,
	result,
}: {
	context: WorkerInstallContext;
	result: WorkerInstallReport;
}) {
	await writeRepoFile(context, INSTALL_REPORT_REF, renderInstallReport(result));
}

function buildReport({
	context,
	outcome,
	branch,
	commit,
	plan,
	proof,
	createdRefs,
	changedRefs,
	localProofRef,
	reportRef,
	kickoff,
}: {
	context: WorkerInstallContext;
	outcome: WorkerInstallResult["outcome"];
	branch: string | null;
	commit: string | null;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	localProofRef: string | null;
	reportRef: string | null;
	kickoff: WorkerKickoffStatus;
}): WorkerInstallReport {
	return {
		schemaVersion: "worker-foundations-install-result.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workflowVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
		outcome,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		branch,
		commit,
		dryRun: context.options.dryRun,
		phases: buildPhaseSummary({ plan, proof, kickoff, outcome }),
		plan,
		proof,
		createdRefs: uniqueRefs(createdRefs),
		changedRefs: uniqueRefs(changedRefs),
		reportRef,
		localProofRef,
		kickoff,
		privacyBoundary: buildPrivacyBoundary(),
	};
}

function buildPhaseSummary({
	plan,
	proof,
	kickoff,
	outcome,
}: {
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	kickoff: WorkerKickoffStatus;
	outcome: WorkerInstallResult["outcome"];
}): WorkerInstallPhase[] {
	const blocked = plan.blockers.length > 0;
	return [
		{
			name: "preflight",
			status: blocked ? "blocked" : "ready",
			reason: blocked ? plan.blockers[0]?.reason : undefined,
		},
		{
			name: "apply",
			status:
				outcome === "ready"
					? "planned"
					: outcome === "blocked" || outcome === "cancelled"
						? "skipped"
						: "applied",
		},
		{
			name: "proof",
			status: proof.some((item) => item.status === "failed")
				? "failed"
				: proof.length > 0
					? "applied"
					: "skipped",
		},
		{
			name: "kickoff",
			status: kickoff.status === "started" ? "applied" : "skipped",
		},
	];
}

function renderInstallReport(result: WorkerInstallReport) {
	const proofLines =
		result.proof.length === 0
			? ["- not run"]
			: result.proof.map((proof) => `- \`${proof.command}\`: ${proof.status}`);
	return [
		"---",
		"title: Worker Install Report",
		"summary: Current Shipbysunday Worker Foundations install state.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Checking the current Worker Foundations install.",
		"---",
		"",
		"# Worker Install Report",
		"",
		`Outcome: \`${result.outcome}\``,
		`Worker bundle version: \`${result.workerBundleVersion}\``,
		`Branch: \`${result.branch ?? "not-created"}\``,
		`Commit: \`${result.commit ? "current branch HEAD after install" : "not-created"}\``,
		`Local proof: \`${result.localProofRef ?? "not-written"}\``,
		"",
		"## Proof",
		"",
		...proofLines,
		"",
		"## Kickoff",
		"",
		`Status: \`${result.kickoff.status}\``,
		`Profile: \`${result.kickoff.codexProfile}\``,
		`Prompt ref: \`${result.kickoff.promptRef}\``,
		"",
		"## Installed Refs",
		"",
		...result.createdRefs.map((ref) => `- created \`${ref}\``),
		...result.changedRefs.map((ref) => `- changed \`${ref}\``),
		"",
	].join("\n");
}

async function maybeRunKickoff(
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

async function commitInstallChanges({
	context,
	touchedRefs,
}: {
	context: WorkerInstallContext;
	touchedRefs: string[];
}) {
	const existingRefs = uniqueRefs(touchedRefs).filter(
		(ref) =>
			isTrackedInstallRef(ref) &&
			existsSync(path.join(context.repositoryRoot, ref)),
	);
	if (existingRefs.length === 0) {
		return null;
	}
	const addResult = await runGit(context.repositoryRoot, [
		"add",
		...existingRefs,
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

async function amendTrackedInstallReport(context: WorkerInstallContext) {
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

function finishResult({
	outcome,
	exitCode,
	summary,
	context,
	plan,
	proof,
	createdRefs,
	changedRefs,
	branch,
	commit,
	localProofRef,
	reportRef,
	kickoff,
}: {
	outcome: WorkerInstallResult["outcome"];
	exitCode: WorkerInstallResult["exitCode"];
	summary: string;
	context: WorkerInstallContext;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	branch: string | null;
	commit: string | null;
	localProofRef: string | null;
	reportRef: string | null;
	kickoff: WorkerKickoffStatus;
}): WorkerInstallResult {
	const report = buildReport({
		context,
		outcome,
		branch,
		commit,
		plan,
		proof,
		createdRefs,
		changedRefs,
		localProofRef,
		reportRef,
		kickoff,
	});
	assertSyncSafeValue(report as JsonValue, "worker install result");
	return { outcome, exitCode, summary, report };
}

function blockedResult({
	summary,
	plan,
	options,
}: {
	summary: string;
	plan: WorkerInstallPlan;
	options: WorkerInstallOptions;
}): WorkerInstallResult {
	const context: WorkerInstallContext = {
		env: process.env,
		now: Date.now(),
		options,
		repositoryRoot: process.cwd(),
		workerHome: resolveWorkerHome(process.env),
		runId: "worker-install-blocked",
	};
	return finishResult({
		outcome: "blocked",
		exitCode: 2,
		summary,
		context,
		plan,
		proof: [],
		createdRefs: [],
		changedRefs: [],
		branch: null,
		commit: null,
		localProofRef: null,
		reportRef: null,
		kickoff: buildSkippedKickoff("blocked"),
	});
}

function buildBlockedPlan({
	packageManager,
	blockers,
}: {
	packageManager: RootPackageManager;
	blockers: WorkerInstallBlocker[];
}): WorkerInstallPlan {
	return {
		schemaVersion: "worker-foundations-install-plan.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workflowVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		packageManager,
		toolchain: {
			runtime: "bun",
			status: "blocked",
			origin: "missing",
			targetRef: "worker-home/toolchains/bun/bin/bun",
		},
		operations: [],
		blockers,
		proofCommands: [],
		privacyBoundary: buildPrivacyBoundary(),
	};
}

function buildSkippedKickoff(reason: string): WorkerKickoffStatus {
	return {
		status: reason === "blocked" ? "blocked" : "skipped",
		promptRef: "docs/worker/install-report.md#kickoff",
		codexProfile: WORKER_CODEX_PROJECT_WRITE_PROFILE,
	};
}

async function confirmInstall({
	options,
	plan,
}: {
	options: WorkerInstallOptions;
	plan: WorkerInstallPlan;
}) {
	process.stdout.write(renderInteractiveInstallChecklist({ options, plan }));
	process.stdout.write("Continue? [y/N] ");
	const answer = await new Promise<string>((resolve) => {
		process.stdin.once("data", (chunk) => resolve(String(chunk)));
	});
	return answer.trim().toLowerCase() === "y";
}

function renderInteractiveInstallChecklist({
	options,
	plan,
}: {
	options: WorkerInstallOptions;
	plan: WorkerInstallPlan;
}) {
	const packageScriptOperations = plan.operations.filter(
		(operation) => operation.surface === "package-script",
	);
	const managedFileOperations = plan.operations.filter(
		(operation) => operation.surface === "file",
	);
	const toolchainOperation = plan.operations.find(
		(operation) => operation.operationId === "toolchain:bun",
	);
	const lines = [
		"Shipbysunday Worker Foundations install checklist",
		"",
		"Preflight",
		...renderPreflightChecklist(plan),
		"",
		"Install",
		renderOperationChecklistItem("Worker Bun toolchain", [toolchainOperation]),
		renderOperationChecklistItem(
			"Root command scripts",
			packageScriptOperations,
		),
		renderOperationChecklistItem("Worker-managed files", managedFileOperations),
		"",
		"Proof",
		...plan.proofCommands.map((command) => `- [ ] ${command}`),
		"",
		"Finish",
		options.noCommit
			? "- [ ] Local commit skipped by --no-commit."
			: "- [ ] Create a local commit on shipbysunday/install after proof passes.",
		options.noKickoff
			? "- [ ] Codex kickoff skipped by --no-kickoff."
			: "- [ ] Start Codex with the Worker-managed project-write profile.",
		"",
		"All listed phases are required for v1; continue or cancel.",
		"",
	];
	return lines.join("\n");
}

function renderPreflightChecklist(plan: WorkerInstallPlan) {
	if (plan.blockers.length === 0) {
		return [
			"- [x] Target repo is clean and ready.",
			"- [x] Worker license is valid outside the repo.",
		];
	}
	return plan.blockers.map((blocker) => {
		const target = blocker.targetRef ? ` (${blocker.targetRef})` : "";
		return `- [!] ${blocker.reason}${target}`;
	});
}

function renderOperationChecklistItem(
	label: string,
	operations: Array<WorkerInstallOperation | undefined>,
) {
	const presentOperations = operations.filter(
		(operation): operation is WorkerInstallOperation => Boolean(operation),
	);
	if (presentOperations.length === 0) {
		return `- [x] ${label}: no changes needed.`;
	}
	const blockedOperation = presentOperations.find(
		(operation) => operation.status === "blocked",
	);
	if (blockedOperation) {
		return `- [!] ${label}: ${blockedOperation.reason}`;
	}
	const counts = countOperationsByStatus(presentOperations);
	const details = [
		counts.add > 0 ? `${counts.add} to add` : null,
		counts["update-managed"] > 0
			? `${counts["update-managed"]} managed updates`
			: null,
		counts.planned > 0 ? `${counts.planned} planned` : null,
		counts.keep > 0 ? `${counts.keep} already ready` : null,
	]
		.filter((detail): detail is string => Boolean(detail))
		.join(", ");
	return `- [ ] ${label}: ${details}.`;
}

function countOperationsByStatus(operations: WorkerInstallOperation[]) {
	const counts: Record<WorkerInstallOperation["status"], number> = {
		add: 0,
		blocked: 0,
		keep: 0,
		planned: 0,
		"update-managed": 0,
	};
	for (const operation of operations) {
		counts[operation.status] += 1;
	}
	return counts;
}

function buildManagedFiles(
	packageManager: RootPackageManager,
): ManagedFileTemplate[] {
	return [
		{
			targetRef: "scripts/run-worker.sh",
			content: runWorkerShellScript(),
			executable: true,
		},
		{ targetRef: "apps/worker/package.json", content: workerPackageJson() },
		{
			targetRef: "apps/worker/bun.lock",
			content: "# Worker package lockfile placeholder.\n",
		},
		{
			targetRef: "apps/worker/worker-manifest.json",
			content: workerManifestJson(),
		},
		{ targetRef: "apps/worker/src/worker-cli.ts", content: workerCliSource() },
		{
			targetRef: "apps/worker/tests/smoke.test.ts",
			content: workerSmokeTestSource(),
		},
		{
			targetRef: "README.md",
			content: rootReadmeMd(packageManager),
			managedSection: true,
		},
		{
			targetRef: "AGENTS.md",
			content: rootAgentsMd(packageManager),
			managedSection: true,
		},
		{ targetRef: "docs/programs/AGENTS.md", content: programsAgentsMd() },
		{ targetRef: "docs/exec-plans/AGENTS.md", content: execPlansAgentsMd() },
		{ targetRef: "docs/prompts/AGENTS.md", content: promptsAgentsMd() },
		{
			targetRef: "docs/programs/PROGRAMS.md",
			content: programsContractMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/PLANS.md",
			content: execPlansContractMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/prompts/README.md",
			content: promptsReadmeMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/programs/active/index.md",
			content: activeProgramsIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/programs/completed/index.md",
			content: completedProgramsIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/active/index.md",
			content: activeExecPlansIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/completed/index.md",
			content: completedExecPlansIndexMd(),
			preserveIfExists: true,
		},
		{ targetRef: ".worker/.gitignore", content: "*\n!.gitignore\n" },
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/program.md`,
			content: starterProgramMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/research-pass-worker-foundations.md`,
			content: starterResearchPassMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/normalized-pass-worker-foundations.md`,
			content: starterNormalizedPassMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/converged-decision-packet.md`,
			content: starterDecisionPacketMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/dependency-graph.md`,
			content: starterDependencyGraphMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/plan-split-recommendation.md`,
			content: starterPlanSplitMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/cross-repo-review.md`,
			content: starterCrossRepoReviewMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/planning-brief-1.md`,
			content: starterPlanningBriefMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/current-planning-brief.txt`,
			content: "planning-brief-1.md\n",
		},
	];
}

function requiredManagedFileRefs(packageManager: RootPackageManager): string[] {
	return buildManagedFiles(packageManager).map((file) => file.targetRef);
}

function expectedScriptCommand(scriptName: WorkerFoundationsRootScript) {
	const workerScript = scriptName === "worker:test" ? "test" : scriptName;
	return `./scripts/run-worker.sh ${workerScript}`;
}

function packageRunCommand(
	packageManager: RootPackageManager,
	scriptName: WorkerFoundationsRootScript,
) {
	return `${packageManager} run ${scriptName}`;
}

function recognizeWorkerScriptCommand(
	scriptName: WorkerFoundationsRootScript,
	currentScript: string,
) {
	const normalizedScript = normalizeScriptCommand(currentScript);
	if (normalizedScript === expectedScriptCommand(scriptName)) {
		return "keep" as const;
	}
	if (scriptName === "worker:test") {
		return "blocked" as const;
	}
	const legacyRuntimeScript = `./scripts/run-runtime.sh ${scriptName}`;
	if (
		normalizedScript === legacyRuntimeScript ||
		normalizedScript === legacyRuntimeScript.slice(2)
	) {
		return "update-managed" as const;
	}
	return "blocked" as const;
}

function normalizeScriptCommand(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function runWorkerShellScript() {
	return [
		"#!/bin/sh",
		"set -eu",
		'SCRIPT_DIR="${0%/*}"',
		'if [ "$SCRIPT_DIR" = "$0" ]; then',
		'  SCRIPT_DIR="."',
		"fi",
		'REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"',
		'WORKER_HOME="${SHIPBYSUNDAY_WORKER_HOME:-$HOME/.worker}"',
		'if [ -x "$WORKER_HOME/toolchains/bun/bin/bun" ]; then',
		'  BUN_BIN="$WORKER_HOME/toolchains/bun/bin/bun"',
		"else",
		'  BUN_BIN="${BUN:-bun}"',
		"fi",
		'if ! command -v "$BUN_BIN" >/dev/null 2>&1; then',
		'  echo "Shipbysunday Worker requires Bun. Re-run shipbysunday install to prepare the Worker-managed Bun toolchain, or install Bun and try again." >&2',
		"  exit 127",
		"fi",
		'case "$BUN_BIN" in',
		'  */*) PATH="${BUN_BIN%/*}:$PATH"; export PATH ;;',
		"esac",
		'cd "$REPO_ROOT/apps/worker"',
		'case "${1:-}" in',
		'  ""|--help|-h)',
		'    exec "$BUN_BIN" src/worker-cli.ts --help',
		"    ;;",
		"esac",
		'exec "$BUN_BIN" run "$@"',
		"",
	].join("\n");
}

function workerPackageJson() {
	return `${JSON.stringify(
		{
			name: "@shipbysunday/worker",
			version: WORKER_FOUNDATIONS_BUNDLE_VERSION,
			private: true,
			type: "module",
			scripts: {
				"programs:lint": "bun src/worker-cli.ts programs:lint",
				"plans:lint": "bun src/worker-cli.ts plans:lint",
				"markdown:lint": "bun src/worker-cli.ts markdown:lint",
				"docs:validate": "bun src/worker-cli.ts docs:validate",
				"program:write-child-plan":
					"bun src/worker-cli.ts program:write-child-plan",
				"execplan:write": "bun src/worker-cli.ts execplan:write",
				"execplan:grill": "bun src/worker-cli.ts execplan:grill",
				"execplan:build": "bun src/worker-cli.ts execplan:build",
				"execplan:validate": "bun src/worker-cli.ts execplan:validate",
				test: "bun test tests",
			},
		},
		null,
		"\t",
	)}\n`;
}

function workerManifestJson(): string {
	return `${JSON.stringify(
		{
			schemaVersion: "shipbysunday-worker-manifest.v1",
			workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
			managedRefs: WORKER_MANIFEST_MANAGED_REFS,
			privacyBoundary: buildPrivacyBoundary(),
		},
		null,
		"\t",
	)}\n`;
}

function workerCliSource() {
	return String.raw`import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type LintReport = { ref: string; issues: string[] };

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const command = process.argv[2];
const commandArgs = process.argv.slice(3);

if (!command || command === "--help" || command === "-h") {
	console.log(renderWorkerHelp());
	process.exit(0);
}

if (command === "programs:lint") {
	exitFromReports(await lintPrograms());
} else if (command === "plans:lint" || command === "execplan:validate") {
	exitFromReports(await lintExecPlans(commandArgs));
} else if (command === "markdown:lint") {
	exitFromReports(await lintMarkdown(commandArgs));
} else if (command === "docs:validate") {
	exitFromReports([
		...(await lintMarkdown([])),
		...(await lintPrograms()),
		...(await lintExecPlans([])),
	]);
} else if (command === "program:write-child-plan") {
	await writeChildPlan(commandArgs);
} else if (command === "execplan:write" || command === "execplan:grill" || command === "execplan:build") {
	console.log(command + " is installed. Use Program-linked ExecPlans as the source of truth.");
} else {
	throw new Error("Unknown Worker command: " + command);
}

function renderWorkerHelp() {
	return [
		"Shipbysunday Worker",
		"",
		"Usage: ./scripts/run-worker.sh <command> [args]",
		"",
		"Commands:",
		"  programs:lint              Validate Worker Program packets.",
		"  plans:lint                 Validate Worker ExecPlans.",
		"  markdown:lint              Validate Worker markdown metadata.",
		"  docs:validate              Run markdown, Program, and ExecPlan validation.",
		"  program:write-child-plan   Create a Program-linked child ExecPlan.",
		"  execplan:validate          Validate one ExecPlan with --plan <path>.",
		"  worker:test                Run the installed Worker tests through the root package script.",
		"  test                       Run the installed Worker tests directly.",
		"",
		"Start with README.md and docs/worker/install-report.md.",
	].join("\n");
}

async function lintPrograms(): Promise<LintReport[]> {
	const reports: LintReport[] = [];
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (!/^\d{4}-\d{2}-\d{2}-.+/.test(path.basename(dir))) continue;
			const ref = toRef(dir);
			const issues: string[] = [];
			for (const required of [
				"program.md",
				"converged-decision-packet.md",
				"dependency-graph.md",
				"plan-split-recommendation.md",
				"cross-repo-review.md",
				"current-planning-brief.txt",
				]) {
					if (!existsSync(path.join(dir, required))) issues.push("Missing " + required + ".");
				}
				const files = await safeReaddir(dir);
				if (!files.some((file) => /^planning-brief-\d+\.md$/.test(file))) issues.push("Missing versioned planning brief.");
				if (!files.some((file) => /^research-pass-.+\.md$/.test(file) || /^track-\d+-.+\.md$/.test(file))) issues.push("Missing research pass.");
				if (!files.some((file) => /^normalized-pass-.+\.md$/.test(file) || /^normalized-track-\d+\.md$/.test(file))) issues.push("Missing normalized pass.");
				const programPath = path.join(dir, "program.md");
				if (existsSync(programPath)) {
					const parsed = parseFrontmatter(await readFile(programPath, "utf8"));
					if (!parsed) {
						issues.push("program.md is missing YAML frontmatter.");
					} else {
						for (const key of ["program_id", "title", "status", "created_at", "completed_at", "summary", "post_build_recap", "read_when"]) {
							if (!parsed.metadata.has(key)) issues.push("program.md missing frontmatter " + key + ".");
						}
						for (const heading of ["## Purpose / Big Picture", "## Program Inputs", "## Current State", "## Progress", "## Decision Log", "## Slice Ledger", "## Next Slice", "## Risks and Watchpoints", "## Outcomes & Retrospective", "## Validation and Acceptance", "## Artifacts and Notes", "## Interfaces and Dependencies"]) {
							if (!parsed.body.includes(heading)) issues.push("program.md missing " + heading + ".");
						}
					}
				}
				reports.push({ ref, issues });
			}
		}
	if (reports.length === 0) reports.push({ ref: "docs/programs", issues: ["No Program packets found."] });
	return reports;
}

async function lintExecPlans(args: string[]): Promise<LintReport[]> {
	const requestedPlan = readArg(args, "--plan");
	const refs = requestedPlan ? [requestedPlan] : await listMarkdownRefs(["docs/exec-plans/active", "docs/exec-plans/completed"]);
	const reports: LintReport[] = [];
	for (const ref of refs) {
		if (ref.endsWith("/index.md")) continue;
		const absolutePath = path.join(repoRoot, ref);
		const issues: string[] = [];
		if (!existsSync(absolutePath)) {
			issues.push("ExecPlan does not exist.");
			reports.push({ ref, issues });
			continue;
		}
		const parsed = parseFrontmatter(await readFile(absolutePath, "utf8"));
		if (!parsed) {
			issues.push("Missing YAML frontmatter block.");
			} else {
				for (const key of ["title", "status", "created_at", "completed_at", "summary", "post_build_recap", "read_when"]) {
					if (!parsed.metadata.has(key)) issues.push("Missing frontmatter " + key + ".");
				}
				const status = parsed.metadata.get("status");
				if (ref.includes("/active/") && status !== "active") issues.push("Active ExecPlan path must use status: active.");
				if (ref.includes("/completed/") && status !== "complete") issues.push("Completed ExecPlan path must use status: complete.");
				const planningBrief = parsed.metadata.get("planning_brief");
				if (typeof planningBrief === "string" && planningBrief.endsWith("current-planning-brief.txt")) {
					issues.push("planning_brief must point at an immutable planning-brief-N.md file.");
				}
				for (const heading of ["## Purpose / Big Picture", "## Progress", "## Surprises & Discoveries", "## Decision Log", "## Outcomes & Retrospective", "## Context and Orientation", "### In Scope", "### Out Of Scope", "## Plan of Work", "## Milestones", "## Concrete Steps", "## Validation and Acceptance", "### Test Commands", "## Idempotence and Recovery", "## Artifacts and Notes", "## Interfaces and Dependencies"]) {
					if (!parsed.body.includes(heading)) issues.push("Missing " + heading + ".");
				}
			}
		reports.push({ ref, issues });
	}
	return reports;
}

async function lintMarkdown(args: string[]): Promise<LintReport[]> {
	const requestedPaths = readPathArgs(args);
	const roots = requestedPaths.length > 0 ? requestedPaths : ["docs/programs", "docs/exec-plans", "docs/prompts", "docs/worker"];
	const refs = await listMarkdownRefs(roots);
	const reports: LintReport[] = [];
	for (const ref of refs) {
		const text = await readFile(path.join(repoRoot, ref), "utf8");
		const issues: string[] = [];
		if (text.includes("\r\n")) issues.push("File must use LF line endings.");
		if (!parseFrontmatter(text)) issues.push("Missing YAML frontmatter block.");
		reports.push({ ref, issues });
	}
	return reports;
}

async function writeChildPlan(args: string[]) {
	const programId = requireArg(args, "--program-id");
	const planRef = requireArg(args, "--plan");
	const title = requireArg(args, "--title");
	const summary = requireArg(args, "--summary");
	if (!planRef.startsWith("docs/exec-plans/active/") || path.normalize(planRef) !== planRef || planRef.includes("..")) {
		throw new Error("write-child-plan requires a normalized active ExecPlan path.");
	}
	const programDir = await findProgramDir(programId);
	const pointerRef = path.join(programDir, "current-planning-brief.txt");
	const briefName = (await readFile(path.join(repoRoot, pointerRef), "utf8")).trim();
	if (!/^planning-brief-\d+\.md$/.test(briefName)) throw new Error("current-planning-brief.txt must point at planning-brief-N.md.");
	const briefRef = path.join(programDir, briefName);
	const absolutePlanPath = path.join(repoRoot, planRef);
	if (existsSync(absolutePlanPath)) throw new Error("Refusing to overwrite existing ExecPlan: " + planRef);
	await mkdir(path.dirname(absolutePlanPath), { recursive: true });
	await writeFile(absolutePlanPath, renderChildPlan({ title, summary, programId, briefRef }));
	console.log("Created " + planRef);
}

function renderChildPlan(input: { title: string; summary: string; programId: string; briefRef: string }) {
	return [
		"---",
		"title: " + input.title,
		"status: active",
		"created_at: 2026-05-08",
		"completed_at: null",
		"summary: " + input.summary,
		"post_build_recap: null",
		"program_id: " + input.programId,
		"planning_brief: " + input.briefRef,
		"read_when:",
		"  - Continuing the installed Worker Foundations loop.",
		"---",
		"",
		"# " + input.title,
		"",
		"This is a living execution plan for continuing the installed Worker Foundations loop.",
		"",
		"This ExecPlan must be maintained in accordance with docs/exec-plans/PLANS.md.",
		"",
		"## Purpose / Big Picture",
		"",
		input.summary,
		"",
		"## Progress",
		"",
		"- [ ] Continue from the installed Worker Foundations handoff.",
		"",
		"## Surprises & Discoveries",
		"",
		"No surprises have been recorded yet.",
		"",
		"## Decision Log",
		"",
		"Decision: Continue through the installed Worker Program and ExecPlan surfaces.",
		"Rationale: The installer proved that the target repo can create Program-linked child plans from local source.",
		"Date: 2026-05-08",
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active. Record the final outcome here before moving it to completed.",
		"",
		"## Context and Orientation",
		"",
		"Follow the linked Program packet and keep proof in checked-in docs plus ignored .worker runs.",
		"",
		"### In Scope",
		"",
		"- Continue the Worker Foundations adoption loop.",
		"",
		"### Out Of Scope",
		"",
		"- Do not configure external providers without a separate plan.",
		"",
		"## Plan of Work",
		"",
		"Read the linked Program, inspect the current target repo, make the smallest safe change, and update this plan as work proceeds.",
		"",
		"## Milestones",
		"",
		"Milestone 1 keeps the Worker Foundations loop current by choosing one bounded next slice and validating it with installed commands.",
		"",
		"## Concrete Steps",
		"",
		"From the repo root, inspect docs/worker/install-report.md, this ExecPlan, and the owning Program packet. Then run the commands listed below after each meaningful change.",
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires this plan to remain linked to an immutable planning brief and for installed Worker validation to pass before completion.",
		"",
		"### Test Commands",
		"",
		"- npm run docs:validate",
		"",
		"## Idempotence and Recovery",
		"",
		"Rerun installed validation after edits. If a step fails, keep the worktree reviewable and update this plan with the recovery path.",
		"",
		"## Artifacts and Notes",
		"",
		"- Planning brief: " + input.briefRef,
		"",
		"## Interfaces and Dependencies",
		"",
		"This plan depends on the installed Worker command surface, the owning Program packet, and the local package scripts installed by Shipbysunday Worker Foundations.",
		"",
	].join("\n");
}

function exitFromReports(reports: LintReport[]) {
	for (const report of reports) {
		if (report.issues.length === 0) console.log(report.ref + ": ok");
		else console.log(report.ref + ":\n" + report.issues.map((issue) => "  - " + issue).join("\n"));
	}
	if (reports.some((report) => report.issues.length > 0)) process.exitCode = 1;
}

async function listDirs(rootRef: string) {
	const absoluteRoot = path.join(repoRoot, rootRef);
	const entries = await safeReaddirWithTypes(absoluteRoot);
	return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(absoluteRoot, entry.name));
}

async function listMarkdownRefs(rootRefs: string[]) {
	const refs: string[] = [];
	for (const rootRef of rootRefs) await collectMarkdownRefs(path.join(repoRoot, rootRef), refs);
	return refs.sort();
}

async function collectMarkdownRefs(absolutePath: string, refs: string[]) {
	const entries = await safeReaddirWithTypes(absolutePath);
	for (const entry of entries) {
		const childPath = path.join(absolutePath, entry.name);
		if (entry.isDirectory()) await collectMarkdownRefs(childPath, refs);
		else if (entry.isFile() && entry.name.endsWith(".md")) refs.push(toRef(childPath));
	}
}

async function safeReaddir(absolutePath: string) {
	try {
		return await readdir(absolutePath);
	} catch {
		return [];
	}
}

async function safeReaddirWithTypes(absolutePath: string) {
	try {
		return await readdir(absolutePath, { withFileTypes: true });
	} catch {
		return [];
	}
}

function parseFrontmatter(text: string) {
	const normalized = text.replaceAll("\r\n", "\n");
	if (!normalized.startsWith("---\n")) return null;
	const end = normalized.indexOf("\n---\n", 4);
	if (end === -1) return null;
	const metadata = new Map<string, string>();
	for (const line of normalized.slice(4, end).split("\n")) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) metadata.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
	}
	return { metadata, body: normalized.slice(end + 5) };
}

async function findProgramDir(programId: string) {
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (path.basename(dir).endsWith("-" + programId)) return toRef(dir);
		}
	}
	throw new Error("No Program packet found for program_id: " + programId);
}

function readArg(args: string[], name: string) {
	const index = args.indexOf(name);
	return index === -1 ? null : args[index + 1] ?? null;
}

function requireArg(args: string[], name: string) {
	const value = readArg(args, name);
	if (!value || value.startsWith("--")) throw new Error("Missing value for " + name);
	return value;
}

function readPathArgs(args: string[]) {
	const paths: string[] = [];
	const index = args.indexOf("--paths");
	if (index === -1) return paths;
	for (const value of args.slice(index + 1)) {
		if (value.startsWith("--")) break;
		paths.push(value);
	}
	return paths;
}

function toRef(absolutePath: string) {
	return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}
`;
}

function workerSmokeTestSource() {
	return [
		'import { existsSync } from "node:fs";',
		'import path from "node:path";',
		'import { fileURLToPath } from "node:url";',
		"",
		'const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");',
		"",
		'describe("Worker Foundations install", () => {',
		'\tit("includes the Worker manifest", () => {',
		'\t\texpect(existsSync(path.join(repoRoot, "apps/worker/worker-manifest.json"))).toBe(true);',
		"\t});",
		"});",
		"",
	].join("\n");
}

function rootReadmeMd(packageManager: RootPackageManager) {
	const docsValidateCommand = packageRunCommand(
		packageManager,
		"docs:validate",
	);
	const workerTestCommand = packageRunCommand(packageManager, "worker:test");
	const programsLintCommand = packageRunCommand(
		packageManager,
		"programs:lint",
	);
	const plansLintCommand = packageRunCommand(packageManager, "plans:lint");
	return [
		"# Shipbysunday Worker",
		"",
		ROOT_AGENT_START,
		"## Shipbysunday Worker",
		"",
		"This repository has the Shipbysunday Worker Foundations operating system installed.",
		"",
		"### Quick Start",
		"",
		`- Validate Worker docs and plans: \`${docsValidateCommand}\``,
		`- Run Worker tests: \`${workerTestCommand}\``,
		"- Show direct Worker commands: `./scripts/run-worker.sh --help`",
		"- Direct fallback for any Worker command: `./scripts/run-worker.sh <command>`",
		"",
		"### Command Surface",
		"",
		`- Programs: \`${programsLintCommand}\``,
		`- ExecPlans: \`${plansLintCommand}\``,
		`- Full Worker validation: \`${docsValidateCommand}\``,
		`- Worker tests: \`${workerTestCommand}\``,
		"",
		"### Handoff",
		"",
		"- Install report: `docs/worker/install-report.md`",
		"- Active Programs: `docs/programs/active/`",
		"- Active ExecPlans: `docs/exec-plans/active/`",
		"- Local Worker proof and run state live under `.worker/` and should stay out of commits.",
		ROOT_AGENT_END,
		"",
	].join("\n");
}

function rootAgentsMd(packageManager: RootPackageManager) {
	return [
		"# AGENTS.md",
		"",
		ROOT_AGENT_START,
		"## Shipbysunday Worker",
		"- Stay inside this repository unless the user explicitly names another path.",
		"- Read `README.md`, `docs/worker/install-report.md`, the active Program, and the active ExecPlan before continuing Worker work.",
		"- Use `docs/worker/install-report.md` as the current Worker install handoff.",
		`- Prefer repo-native Worker commands such as \`${packageRunCommand(packageManager, "docs:validate")}\` and \`${packageRunCommand(packageManager, "worker:test")}\`.`,
		"- Use `./scripts/run-worker.sh <command>` as the direct fallback when package-manager context is unclear.",
		"- Run `./scripts/run-worker.sh --help` to inspect the installed Worker command surface.",
		"- Use Program packets in `docs/programs/active/` for multi-slice initiatives.",
		"- Use ExecPlans in `docs/exec-plans/active/` for concrete implementation work.",
		"- Keep `.worker/` local and out of commits.",
		"- Do not store secrets, raw logs, Codex transcripts, or local absolute paths in checked-in Worker proof.",
		ROOT_AGENT_END,
		"",
	].join("\n");
}

function programsAgentsMd() {
	return agentsDoc({
		title: "Program Instructions",
		summary: "Local instructions for editing Worker Program packets.",
		lines: [
			"Program packets preserve initiative state. Keep `current-planning-brief.txt` pointed at a versioned planning brief and keep indexes current.",
		],
	});
}

function execPlansAgentsMd() {
	return agentsDoc({
		title: "ExecPlan Instructions",
		summary: "Local instructions for editing Worker ExecPlans.",
		lines: [
			"ExecPlans must record `program_id` and an immutable `planning_brief` path when they belong to a Program.",
		],
	});
}

function promptsAgentsMd() {
	return agentsDoc({
		title: "Prompt Instructions",
		summary: "Local instructions for editing Worker prompt contracts.",
		lines: [
			"Prompt contracts are product behavior. Keep them concise, inspectable, and aligned with local commands.",
		],
	});
}

function programsContractMd() {
	return frontmatterDoc({
		title: "Programs",
		summary: "Contract for Worker Program packets.",
		body: [
			"# Programs",
			"",
			"A Program packet lives under `docs/programs/active/<date>-<program-id>/` or `docs/programs/completed/<date>-<program-id>/`.",
			"",
			"Required files: `program.md`, research pass, normalized pass, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, `planning-brief-N.md`, and `current-planning-brief.txt`.",
			"",
		],
	});
}

function execPlansContractMd() {
	return frontmatterDoc({
		title: "ExecPlans",
		summary: "Contract for Worker ExecPlans.",
		body: [
			"# ExecPlans",
			"",
			"ExecPlans live under `docs/exec-plans/active/` or `docs/exec-plans/completed/` and must keep status aligned with their path.",
			"",
			"Program-linked ExecPlans must point `planning_brief` at `planning-brief-N.md`, never `current-planning-brief.txt`.",
			"",
		],
	});
}

function promptsReadmeMd() {
	return frontmatterDoc({
		title: "Prompt Contracts",
		summary: "Prompt inventory for the installed Worker operating system.",
		body: [
			"# Prompt Contracts",
			"",
			"Prompts should be explicit, local, and reviewable.",
			"",
		],
	});
}

function activeProgramsIndexMd() {
	return indexDoc("Active Programs", "Index of active Worker Programs.");
}

function completedProgramsIndexMd() {
	return indexDoc("Completed Programs", "Index of completed Worker Programs.");
}

function activeExecPlansIndexMd() {
	return indexDoc("Active ExecPlans", "Index of active Worker ExecPlans.");
}

function completedExecPlansIndexMd() {
	return indexDoc(
		"Completed ExecPlans",
		"Index of completed Worker ExecPlans.",
	);
}

function starterProgramMd() {
	return [
		"---",
		"program_id: worker-foundations-adoption",
		"title: Worker Foundations Adoption",
		"status: active",
		"created_at: 2026-05-08",
		"completed_at: null",
		"summary: Adopt the installed Shipbysunday Worker Foundations operating system.",
		"post_build_recap: null",
		"read_when:",
		"  - Continuing from the initial Worker Foundations install.",
		"---",
		"",
		"# Worker Foundations Adoption",
		"",
		"This Program is a living initiative document for continuing the installed Worker Foundations operating system.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		"This Program dogfoods the installed Worker Foundations operating system in this repository.",
		"",
		"## Program Inputs",
		"",
		"The initial Program packet was created by `shipbysunday install` and is driven by `planning-brief-1.md`.",
		"",
		"## Current State",
		"",
		"Worker Foundations source, scripts, local proof, and this Program packet are installed in the target repo.",
		"",
		"## Progress",
		"",
		"- [x] Worker Foundations installer created the starter Program packet.",
		"- [ ] Continue implementation through child ExecPlans.",
		"",
		"## Decision Log",
		"",
		"Decision: Continue future work through Program-linked ExecPlans.",
		"Rationale: The installer proved that child plans can record immutable planning brief provenance.",
		"Date: 2026-05-08",
		"",
		"## Slice Ledger",
		"",
		"The first child ExecPlan is `docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md`.",
		"",
		"## Next Slice",
		"",
		"Continue from the active child ExecPlan and keep the installed validation commands passing.",
		"",
		"## Risks and Watchpoints",
		"",
		"Do not store secrets, raw logs, Codex transcripts, or local absolute paths in checked-in Worker proof.",
		"",
		"## Outcomes & Retrospective",
		"",
		"This Program is active. Record outcomes here when the adoption loop is complete.",
		"",
		"## Validation and Acceptance",
		"",
		"The installed Worker command surface should pass `docs:validate` and `worker:test` before this Program is considered healthy.",
		"",
		"## Artifacts and Notes",
		"",
		"- Install report: `docs/worker/install-report.md`",
		"- Local proof root: `.worker/`",
		"",
		"## Interfaces and Dependencies",
		"",
		"This Program depends on `scripts/run-worker.sh`, `apps/worker`, root package scripts, and the installed Worker planning brief.",
		"",
	].join("\n");
}

function starterResearchPassMd() {
	return packetDoc(
		"Worker Foundations Research Pass",
		"The installer added local Worker source, command forwarding, and Program/ExecPlan contracts.",
	);
}

function starterNormalizedPassMd() {
	return packetDoc(
		"Worker Foundations Normalized Pass",
		"Use the installed Worker commands as the local planning operating system.",
	);
}

function starterDecisionPacketMd() {
	return packetDoc(
		"Worker Foundations Decision Packet",
		"Continue work through Program-linked ExecPlans and keep proof sync-safe.",
	);
}

function starterDependencyGraphMd() {
	return packetDoc(
		"Worker Foundations Dependency Graph",
		"Validate the installed commands before widening into app-specific automation.",
	);
}

function starterPlanSplitMd() {
	return packetDoc(
		"Worker Foundations Plan Split",
		"Start with one child ExecPlan created through `program:write-child-plan`.",
	);
}

function starterCrossRepoReviewMd() {
	return packetDoc(
		"Worker Foundations Cross-Repo Review",
		"Avoid provider setup, app process assumptions, and raw local proof in tracked docs.",
	);
}

function starterPlanningBriefMd() {
	return [
		"---",
		"title: Worker Foundations Planning Brief",
		"program_id: worker-foundations-adoption",
		"brief_version: 1",
		"status: current",
		"summary: First planning brief for the installed Worker Foundations Program.",
		"read_when:",
		"  - Writing the first child ExecPlan after install.",
		"---",
		"",
		"# Worker Foundations Planning Brief",
		"",
		"Create the first child ExecPlan through the installed `program:write-child-plan` command and continue from checked-in repo context.",
		"",
	].join("\n");
}

function packetDoc(title: string, summary: string) {
	return frontmatterDoc({
		title,
		summary,
		body: ["# " + title, "", summary, ""],
	});
}

function indexDoc(title: string, summary: string) {
	return frontmatterDoc({
		title,
		summary,
		body: [
			"# " + title,
			"",
			"This index is maintained by the Worker operating system.",
			"",
		],
	});
}

function frontmatterDoc({
	title,
	summary,
	body,
}: {
	title: string;
	summary: string;
	body: string[];
}) {
	return [
		"---",
		"title: " + title,
		"summary: " + summary,
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Working with the installed Worker operating system.",
		"---",
		"",
		...body,
	].join("\n");
}

function agentsDoc({
	title,
	summary,
	lines,
}: {
	title: string;
	summary: string;
	lines: string[];
}) {
	return frontmatterDoc({
		title,
		summary,
		body: [
			"# " + title,
			"",
			ROOT_AGENT_START,
			"## Shipbysunday Worker",
			...lines.map((line) => "- " + line),
			ROOT_AGENT_END,
			"",
		],
	});
}

function parseJsonObject(text: string): JsonObject | null {
	try {
		const value = JSON.parse(text) as JsonValue;
		return isJsonObject(value) ? value : null;
	} catch {
		return null;
	}
}

function defaultRootPackageJson(): JsonObject {
	return {
		name: "shipbysunday-worker-project",
		private: true,
		packageManager: `bun@${WORKER_MANAGED_BUN_VERSION}`,
		scripts: {},
	};
}

function ensureJsonObjectProperty(object: JsonObject, key: string) {
	const value = object[key];
	if (isJsonObject(value)) {
		return value;
	}
	if (value !== undefined) {
		throw new Error(`package.json#${key} must be an object.`);
	}
	const nextValue: JsonObject = {};
	object[key] = nextValue;
	return nextValue;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function detectJsonIndent(text: string) {
	return text.match(/\n([ \t]+)"/u)?.[1] ?? "\t";
}

function detectRootPackageManager({
	packageJson,
	repositoryRoot,
}: {
	packageJson: JsonObject;
	repositoryRoot: string;
}): RootPackageManager {
	const packageManager = packageJson.packageManager;
	if (typeof packageManager === "string") {
		if (packageManager.startsWith("bun@")) return "bun";
		if (packageManager.startsWith("pnpm@")) return "pnpm";
		if (packageManager.startsWith("yarn@")) return "yarn";
		if (packageManager.startsWith("npm@")) return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "bun.lock"))) return "bun";
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) return "yarn";
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) return "npm";
	return "bun";
}

async function isGitWorktreeClean(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["status", "--porcelain"]);
	return result.succeeded && result.stdout.trim() === "";
}

async function readCurrentBranch(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	return result.succeeded ? result.stdout.trim() : null;
}

async function gitBranchExists(repositoryRoot: string) {
	return (
		await runGit(repositoryRoot, [
			"rev-parse",
			"--verify",
			`refs/heads/${WORKER_FOUNDATIONS_INSTALL_BRANCH}`,
		])
	).succeeded;
}

async function runGit(repositoryRoot: string, args: string[]) {
	return await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 30_000,
	});
}

async function commandReportsExpectedBunVersion(
	command: string,
	env: NodeJS.ProcessEnv = process.env,
) {
	const result = await runBoundedProcess({
		command,
		args: ["--version"],
		env,
		timeoutMs: 5_000,
	});
	return (
		result.succeeded && result.stdout.trim() === WORKER_MANAGED_BUN_VERSION
	);
}

async function assertExpectedBunVersion(
	command: string,
	env: NodeJS.ProcessEnv = process.env,
) {
	if (!(await commandReportsExpectedBunVersion(command, env))) {
		throw new Error(
			`Prepared Worker-managed Bun toolchain must report version ${WORKER_MANAGED_BUN_VERSION}.`,
		);
	}
}

function resolveBunCommand(context: WorkerInstallContext) {
	const managedBunPath = resolveManagedBunPath(context);
	return existsSync(managedBunPath) &&
		commandReportsExpectedBunVersionSync(
			managedBunPath,
			buildWorkerProcessEnv(context),
		)
		? managedBunPath
		: "bun";
}

function resolveManagedBunPath(context: WorkerInstallContext) {
	return path.join(context.workerHome, "toolchains", "bun", "bin", "bun");
}

function commandReportsExpectedBunVersionSync(
	command: string,
	env: NodeJS.ProcessEnv = process.env,
) {
	const result = spawnSync(command, ["--version"], {
		env,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});
	return (
		result.status === 0 &&
		typeof result.stdout === "string" &&
		result.stdout.trim() === WORKER_MANAGED_BUN_VERSION
	);
}

function buildWorkerProcessEnv(
	context: WorkerInstallContext,
): NodeJS.ProcessEnv {
	return {
		...context.env,
		[WORKER_MACHINE_HOME_ENV_VAR]: context.workerHome,
	};
}

function buildCodexKickoffEnv(
	context: WorkerInstallContext,
): NodeJS.ProcessEnv {
	const allowedKeys = [
		"CODEX_HOME",
		"HOME",
		"LANG",
		"LC_ALL",
		"LOGNAME",
		"PATH",
		"SHELL",
		"TERM",
		"TMPDIR",
		"USER",
		"XDG_CONFIG_HOME",
		"XDG_DATA_HOME",
	] as const;
	const nextEnv: NodeJS.ProcessEnv = {};
	for (const key of allowedKeys) {
		const value = context.env[key];
		if (value) {
			nextEnv[key] = value;
		}
	}
	nextEnv[WORKER_MACHINE_HOME_ENV_VAR] = context.workerHome;
	return nextEnv;
}

async function rollbackWorkerCodexConfig({
	env,
	backupPath,
}: {
	env: NodeJS.ProcessEnv;
	backupPath: string | null;
}) {
	if (!backupPath) {
		return;
	}
	try {
		await rollbackShipbysundayWorkerCodexConfigPatch({ env, backupPath });
	} catch {
		// Keep the install failure path focused on the original failure.
	}
}

async function writeRepoFile(
	context: WorkerInstallContext,
	targetRef: string,
	content: string,
) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, normalizeManagedContent(content));
}

function normalizeManagedContent(content: string) {
	return `${content.replace(/\r\n/g, "\n").trimEnd()}\n`;
}

function extractManagedBlock(content: string) {
	const normalized = normalizeManagedContent(content);
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error("Worker managed template is missing managed markers.");
	}
	return normalized.slice(startIndex, endIndex + ROOT_AGENT_END.length);
}

function hasIncompleteManagedBlock(content: string) {
	const normalized = normalizeManagedContent(content);
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	return (startIndex === -1) !== (endIndex === -1) || endIndex < startIndex;
}

function replaceOrAppendManagedBlock({
	currentContent,
	managedBlock,
}: {
	currentContent: string;
	managedBlock: string;
}) {
	const normalized = normalizeManagedContent(currentContent);
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	if (startIndex === -1 && endIndex === -1) {
		return `${normalized.trimEnd()}\n\n${managedBlock}\n`;
	}
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error("Existing file has incomplete Worker managed markers.");
	}
	return `${normalized.slice(0, startIndex).trimEnd()}\n\n${managedBlock}\n\n${normalized.slice(endIndex + ROOT_AGENT_END.length).trimStart()}`;
}

function isRecognizedStarterChildPlan(content: string) {
	return (
		content.includes("program_id: worker-foundations-adoption") &&
		content.includes(
			`planning_brief: ${STARTER_PROGRAM_ROOT}/planning-brief-1.md`,
		) &&
		content.includes("# Continue Worker Foundations Adoption")
	);
}

function uniqueRefs(refs: string[]) {
	return [...new Set(refs)].sort();
}

function isTrackedInstallRef(ref: string) {
	return ref !== ".worker" && !ref.startsWith(".worker/");
}

function buildPrivacyBoundary(): WorkerPrivacyBoundary {
	return {
		rawSourceIncluded: false,
		rawLogsIncluded: false,
		packageScriptBodiesIncluded: false,
		dependencyVersionsIncluded: false,
		localAbsolutePathsIncluded: false,
		codexTranscriptsIncluded: false,
	};
}
