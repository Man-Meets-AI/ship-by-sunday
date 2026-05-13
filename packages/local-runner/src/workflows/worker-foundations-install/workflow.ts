import { spawnSync } from "node:child_process";
import { verify } from "node:crypto";
import { existsSync } from "node:fs";
import {
	chmod,
	lstat,
	mkdir,
	readFile,
	readdir,
	unlink,
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
import {
	readRunnerCredential,
	resolveLocalRunnerHome,
} from "../../core/local-runner-home";
import { assertSyncSafeValue } from "../../core/redaction";
import { resolveRepositoryRoot } from "../../core/repository-root";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
	type RunnerEventPayload,
} from "../../core/runner-events";
import {
	WORKER_CODEX_PROJECT_WRITE_PROFILE,
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_COMMIT_MESSAGE,
	WORKER_FOUNDATIONS_INSTALL_BRANCH,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
	WORKER_FOUNDATIONS_PROOF_SCRIPTS,
	WORKER_FOUNDATIONS_ROOT_SCRIPTS,
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
	toolchain: WorkerNodeRuntimePlan;
	operations: WorkerInstallOperation[];
	blockers: WorkerInstallBlocker[];
	proofCommands: string[];
	privacyBoundary: WorkerPrivacyBoundary;
};

type WorkerNodeRuntimePlan = {
	runtime: "node";
	status: "available" | "blocked";
	origin: "path" | "missing";
	targetRef: "system-node";
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

type FinishResultInput = {
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
	nodeRuntime: WorkerNodeRuntimePlan;
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
	licenseSignature: string;
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

type RootPackageManager = "npm" | "pnpm" | "yarn";

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
	"apps/worker/worker-manifest.json",
	"apps/worker/src/worker-cli.mjs",
	"apps/worker/tests/smoke.test.mjs",
] as const;
const DEFAULT_WORKER_LICENSE_API_BASE_URL = "https://www.man-meets-ai.com";
const WORKER_LICENSE_ACTIVATION_START_PATH = "/api/worker/license/device/start";
const WORKER_LICENSE_ACTIVATION_POLL_PATH = "/api/worker/license/device/poll";
const WORKER_LICENSE_SIGNATURE_PUBLIC_KEY = [
	"-----BEGIN PUBLIC KEY-----",
	"MCowBQYDK2VwAyEA7OwhZk5d2NxVCVxbAHHEigPG3/Sr3oYMXNy/SpbFmLc=",
	"-----END PUBLIC KEY-----",
].join("\n");
const MIN_ACTIVATION_POLL_INTERVAL_MS = 1_000;
const MAX_ACTIVATION_POLL_INTERVAL_MS = 10_000;
const DEFAULT_ACTIVATION_TIMEOUT_MS = 5 * 60_000;
const WORKER_DEFAULT_NPM_VERSION = "11.12.1";
const SHIP_BY_SUNDAY_RUNNER_PACKAGE_SPEC = `ship-by-sunday@${WORKER_FOUNDATIONS_BUNDLE_VERSION}`;
const LEGACY_WORKER_BUN_LOCK_REF = "apps/worker/bun.lock";
const LEGACY_WORKER_BUN_LOCK_CONTENT =
	"# Worker package lockfile placeholder.\n";

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
			return await finishAndMaybeSyncResult({
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
		return await finishAndMaybeSyncResult({
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
		return await finishAndMaybeSyncResult({
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
		return await finishAndMaybeSyncResult({
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
		return await finishAndMaybeSyncResult({
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
			return await finishAndMaybeSyncResult({
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

	const branchResult = await prepareInstallBranch(context);
	if (branchResult.status === "blocked") {
		return await finishAndMaybeSyncResult({
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
			return await finishAndMaybeSyncResult({
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
			return await finishAndMaybeSyncResult({
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

		return await finishAndMaybeSyncResult({
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
	if (
		typeof parsed.licenseSignature !== "string" ||
		parsed.licenseSignature.trim() === ""
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the license signature is missing.",
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
	const canonicalLicense = canonicalizeWorkerLicenseFields(parsed);
	if (
		!verifyWorkerLicenseSignature(canonicalLicense, parsed.licenseSignature)
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the license signature is not trusted.",
		};
	}
	return {
		valid: true,
		license: {
			schemaVersion: parsed.schemaVersion,
			status: parsed.status,
			machineCredential: parsed.machineCredential,
			licenseSignature: parsed.licenseSignature,
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

function canonicalizeWorkerLicenseFields(license: JsonObject) {
	return JSON.stringify({
		schemaVersion: license.schemaVersion,
		status: license.status,
		machineCredential: license.machineCredential,
		...(typeof license.accountId === "string"
			? { accountId: license.accountId }
			: {}),
		...(typeof license.machineId === "string"
			? { machineId: license.machineId }
			: {}),
		...(typeof license.issued_at === "string"
			? { issued_at: license.issued_at }
			: {}),
		...(typeof license.expires_at === "string"
			? { expires_at: license.expires_at }
			: {}),
	});
}

function verifyWorkerLicenseSignature(
	canonicalLicense: string,
	licenseSignature: string,
) {
	try {
		return verify(
			null,
			Buffer.from(canonicalLicense, "utf8"),
			WORKER_LICENSE_SIGNATURE_PUBLIC_KEY,
			Buffer.from(licenseSignature, "base64url"),
		);
	} catch {
		return false;
	}
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

function buildInstallPlan(inspection: TargetRepoInspection): WorkerInstallPlan {
	const operations: WorkerInstallOperation[] = [];
	operations.push(buildNodeRuntimeOperation(inspection.nodeRuntime));
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
		toolchain: inspection.nodeRuntime,
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

function buildNodeRuntimeOperation(
	runtime: WorkerNodeRuntimePlan,
): WorkerInstallOperation {
	if (runtime.status === "available") {
		return {
			operationId: "runtime:node",
			surface: "toolchain",
			targetRef: runtime.targetRef,
			status: "keep",
			reason: "Node is available on PATH.",
		};
	}
	return {
		operationId: "runtime:node",
		surface: "toolchain",
		targetRef: runtime.targetRef,
		status: "blocked",
		reason: "Node is required for Worker commands.",
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
				"Root package.json will be created with npm defaults and this Worker command script.",
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

async function applyWorkerFoundations(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
): Promise<ApplyResult> {
	const applyResult: ApplyResult = { createdRefs: [], changedRefs: [] };
	await writePackageJsonScripts(context, applyResult);
	await writeManagedFileSet(context, applyResult, packageManager);
	await removeLegacyWorkerBunLock(context, applyResult, packageManager);
	await appendGitInfoExclude(context);
	return applyResult;
}

async function writePackageJsonScripts(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
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
	const packageManagerIdentity = packageJson.packageManager;
	if (typeof packageManagerIdentity === "string") {
		if (packageManagerIdentity.startsWith("bun@")) {
			packageJson.packageManager = `npm@${WORKER_DEFAULT_NPM_VERSION}`;
		}
	} else if (!hasRootPackageManagerLockfile(context.repositoryRoot)) {
		packageJson.packageManager = `npm@${WORKER_DEFAULT_NPM_VERSION}`;
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

async function removeLegacyWorkerBunLock(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
	packageManager: RootPackageManager,
) {
	const absolutePath = path.join(
		context.repositoryRoot,
		LEGACY_WORKER_BUN_LOCK_REF,
	);
	if (!existsSync(absolutePath)) {
		return;
	}
	const currentContent = normalizeManagedContent(
		await readFile(absolutePath, "utf8"),
	);
	if (
		currentContent !== normalizeManagedContent(LEGACY_WORKER_BUN_LOCK_CONTENT)
	) {
		return;
	}
	if (!(await hasRecognizedWorkerAppManagedContent(context, packageManager))) {
		return;
	}
	await unlink(absolutePath);
	applyResult.changedRefs.push(LEGACY_WORKER_BUN_LOCK_REF);
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
			const markerStatus = inspectManagedBlockMarkers(
				await readFile(absolutePath, "utf8"),
			);
			if (markerStatus === "incomplete" || markerStatus === "duplicate") {
				blockers.push({
					blockerId: `file-conflict:${file.targetRef}`,
					targetRef: file.targetRef,
					reason: `Existing ${file.targetRef} has ${markerStatus} Worker managed markers.`,
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
	blockers.push(...(await findWorkerAppFileBlockers(context, packageManager)));
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

async function findWorkerAppFileBlockers(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const blockers: WorkerInstallBlocker[] = [];
	const workerAppRoot = path.join(context.repositoryRoot, "apps/worker");
	if (!existsSync(workerAppRoot)) {
		return blockers;
	}
	if (!(await lstat(workerAppRoot)).isDirectory()) {
		blockers.push({
			blockerId: "file-conflict:apps/worker",
			targetRef: "apps/worker",
			reason: "Existing apps/worker path is not a Worker-managed directory.",
		});
		return blockers;
	}
	const managedWorkerRefs = new Set(
		buildManagedFiles(packageManager)
			.filter((file) => file.targetRef.startsWith("apps/worker/"))
			.map((file) => file.targetRef),
	);
	for (const targetRef of await collectExistingFileRefs({
		absoluteRoot: workerAppRoot,
		repositoryRoot: context.repositoryRoot,
	})) {
		if (managedWorkerRefs.has(targetRef)) {
			continue;
		}
		if (
			(await isLegacyWorkerManagedFile(context, targetRef)) &&
			(await hasRecognizedWorkerAppManagedContent(context, packageManager))
		) {
			continue;
		}
		blockers.push({
			blockerId: `file-conflict:${targetRef}`,
			targetRef,
			reason: "Existing apps/worker file is not recognized as Worker-managed.",
		});
	}
	return blockers;
}

async function collectExistingFileRefs({
	absoluteRoot,
	repositoryRoot,
}: {
	absoluteRoot: string;
	repositoryRoot: string;
}) {
	const refs: string[] = [];
	await collectExistingFileRefsInto({
		absolutePath: absoluteRoot,
		repositoryRoot,
		refs,
	});
	return refs.sort();
}

async function collectExistingFileRefsInto({
	absolutePath,
	repositoryRoot,
	refs,
}: {
	absolutePath: string;
	repositoryRoot: string;
	refs: string[];
}) {
	for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
		const childPath = path.join(absolutePath, entry.name);
		if (entry.isDirectory()) {
			await collectExistingFileRefsInto({
				absolutePath: childPath,
				repositoryRoot,
				refs,
			});
			continue;
		}
		if (entry.isFile() || entry.isSymbolicLink()) {
			refs.push(
				path.relative(repositoryRoot, childPath).split(path.sep).join("/"),
			);
		}
	}
}

async function isLegacyWorkerManagedFile(
	context: WorkerInstallContext,
	targetRef: string,
) {
	if (targetRef !== LEGACY_WORKER_BUN_LOCK_REF) {
		return false;
	}
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	return (
		normalizeManagedContent(await readFile(absolutePath, "utf8")) ===
		normalizeManagedContent(LEGACY_WORKER_BUN_LOCK_CONTENT)
	);
}

async function hasRecognizedWorkerAppManagedContent(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	let recognizedManagedFileCount = 0;
	for (const file of buildManagedFiles(packageManager)) {
		if (!file.targetRef.startsWith("apps/worker/")) {
			continue;
		}
		const absolutePath = path.join(context.repositoryRoot, file.targetRef);
		if (!existsSync(absolutePath)) {
			continue;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		if (currentContent !== normalizeManagedContent(file.content)) {
			return false;
		}
		recognizedManagedFileCount += 1;
	}
	return recognizedManagedFileCount > 0;
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
	const result = await runBoundedProcess({
		command: packageManager,
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

async function finishAndMaybeSyncResult(
	input: FinishResultInput,
): Promise<WorkerInstallResult> {
	const result = finishResult(input);
	await emitWorkerInstallRunnerEvent({
		context: input.context,
		result,
	}).catch(() => undefined);
	return result;
}

async function emitWorkerInstallRunnerEvent({
	context,
	result,
}: {
	context: WorkerInstallContext;
	result: WorkerInstallResult;
}) {
	const payload = buildWorkerInstallRunnerEventPayload(result);
	if (!payload) {
		return;
	}

	const credential = await readRunnerCredential({
		repositoryRoot: context.repositoryRoot,
		runnerHome: resolveLocalRunnerHome(context.env),
	});
	if (!credential) {
		return;
	}

	const event = createRunnerEvent({
		projectId: credential.projectId,
		runnerId: credential.runnerId,
		payload,
	});
	await queueRunnerEvent(context.repositoryRoot, event);
	await flushRunnerEvents({
		repositoryRoot: context.repositoryRoot,
		credential,
	});
}

function buildWorkerInstallRunnerEventPayload(
	result: WorkerInstallResult,
): RunnerEventPayload | null {
	const report = result.report;
	if (!report) {
		return null;
	}

	const basePayload = {
		summary: result.summary,
		...(report.branch ? { branch: report.branch } : {}),
		...(report.commit ? { commitHash: report.commit.slice(0, 12) } : {}),
		...(report.reportRef ? { reportRef: report.reportRef } : {}),
		...(isSyncSafeRepoRelativeRef(report.localProofRef)
			? { localProofRef: report.localProofRef }
			: {}),
		createdRefs: report.createdRefs,
		changedRefs: report.changedRefs,
		proofCommandResults: report.proof.map((proof) => ({
			commandLabel: proof.command,
			status: proof.status,
		})),
	};

	if (report.outcome === "ready") {
		return {
			eventType: "worker.install.previewed",
			outcome: "ready",
			status: "ready",
			...basePayload,
		};
	}

	if (report.outcome === "installed") {
		return {
			eventType: "worker.install.completed",
			outcome: "installed",
			status: "installed",
			...basePayload,
		};
	}

	if (
		report.outcome === "blocked" ||
		report.outcome === "failed" ||
		report.outcome === "cancelled"
	) {
		return {
			eventType: "worker.install.blocked",
			outcome: report.outcome,
			status: report.outcome,
			...basePayload,
			blockerIds: report.plan.blockers.map((blocker) => blocker.blockerId),
			blockerReasons: report.plan.blockers.map((blocker) => blocker.reason),
		};
	}

	return null;
}

function isSyncSafeRepoRelativeRef(ref: string | null): ref is string {
	if (!ref || path.isAbsolute(ref) || ref.startsWith("../")) {
		return false;
	}

	return !ref.split(/[\\/]/).includes("..");
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
}: FinishResultInput): WorkerInstallResult {
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
			runtime: "node",
			status: "blocked",
			origin: "missing",
			targetRef: "system-node",
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
	const runtimeOperation = plan.operations.find(
		(operation) => operation.operationId === "runtime:node",
	);
	const lines = [
		"Shipbysunday Worker Foundations install checklist",
		"",
		"Preflight",
		...renderPreflightChecklist(plan),
		"",
		"Install",
		renderOperationChecklistItem("Worker Node runtime", [runtimeOperation]),
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
			targetRef: "apps/worker/worker-manifest.json",
			content: workerManifestJson(),
		},
		{ targetRef: "apps/worker/src/worker-cli.mjs", content: workerCliSource() },
		{
			targetRef: "apps/worker/tests/smoke.test.mjs",
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
		'NODE_BIN="${NODE:-node}"',
		'if ! command -v "$NODE_BIN" >/dev/null 2>&1; then',
		'  echo "Shipbysunday Worker requires Node on PATH." >&2',
		"  exit 127",
		"fi",
		'case "$NODE_BIN" in',
		'  */*) NODE_DIR="${NODE_BIN%/*}"; PATH="${PATH:+$PATH:}$NODE_DIR"; export PATH ;;',
		"esac",
		'cd "$REPO_ROOT/apps/worker"',
		'case "${1:-}" in',
		'  ""|--help|-h)',
		'    exec "$NODE_BIN" src/worker-cli.mjs --help',
		"    ;;",
		"esac",
		'if [ "${1:-}" = "worker:test" ] || [ "${1:-}" = "test" ]; then',
		"  shift",
		'  exec "$NODE_BIN" --test tests/*.mjs "$@"',
		"fi",
		'exec "$NODE_BIN" src/worker-cli.mjs "$@"',
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
				"programs:lint": "node src/worker-cli.mjs programs:lint",
				"plans:lint": "node src/worker-cli.mjs plans:lint",
				"markdown:lint": "node src/worker-cli.mjs markdown:lint",
				"docs:validate": "node src/worker-cli.mjs docs:validate",
				"program:write-child-plan":
					"node src/worker-cli.mjs program:write-child-plan",
				"execplan:write": "node src/worker-cli.mjs execplan:write",
				"execplan:grill": "node src/worker-cli.mjs execplan:grill",
				"execplan:build": "node src/worker-cli.mjs execplan:build",
				"execplan:validate": "node src/worker-cli.mjs execplan:validate",
				"worker:test": "node --test tests/*.mjs",
				test: "node --test tests/*.mjs",
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
	return String.raw`import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const command = process.argv[2];
const commandArgs = process.argv.slice(3);
const shipBySundayPackageSpec = process.env.SHIPBYSUNDAY_PACKAGE_SPEC || ${JSON.stringify(SHIP_BY_SUNDAY_RUNNER_PACKAGE_SPEC)};

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
} else if (command === "execplan:build") {
	await runExecPlanBuild(commandArgs);
} else if (command === "execplan:write" || command === "execplan:grill") {
	console.log(command + " is installed. Use Program-linked ExecPlans as the source of truth.");
} else {
	throw new Error("Unknown Worker command: " + command);
}

async function runExecPlanBuild(args) {
	const runner = resolveShipBySundayRunner();
	if (!runner) {
		throw new Error("execplan:build requires the Ship by Sunday local runner CLI. Install or expose ship-by-sunday, set SHIPBYSUNDAY_CLI, or make npx/npm available so the Worker can run " + shipBySundayPackageSpec + ".");
	}
	const forwardedArgs = [...runner.args, "execplan", "build", ...withRepoArg(args)];
	const exitCode = await runInheritedProcess(runner.command, forwardedArgs);
	if (exitCode !== 0) process.exitCode = exitCode;
}

function withRepoArg(args) {
	return args.includes("--repo") ? args : ["--repo", repoRoot, ...args];
}

function resolveShipBySundayRunner() {
	if (process.env.SHIPBYSUNDAY_CLI) {
		return { command: process.env.SHIPBYSUNDAY_CLI, args: [] };
	}
	for (const candidate of ["ship-by-sunday", "shipbysunday"]) {
		const found = findExecutableOnPath(candidate);
		if (found) return { command: found, args: [] };
	}
	const npx = findExecutableOnPath("npx");
	if (npx) {
		return {
			command: npx,
			args: ["--yes", "--package", shipBySundayPackageSpec, "ship-by-sunday"],
		};
	}
	const npm = findExecutableOnPath("npm");
	if (npm) {
		return {
			command: npm,
			args: ["exec", "--yes", "--package", shipBySundayPackageSpec, "--", "ship-by-sunday"],
		};
	}
	return null;
}

function findExecutableOnPath(commandName) {
	const pathValue = process.env.PATH || "";
	const suffixes = process.platform === "win32" ? ["", ".cmd", ".exe"] : [""];
	for (const dir of pathValue.split(path.delimiter)) {
		if (!dir) continue;
		for (const suffix of suffixes) {
			const candidate = path.join(dir, commandName + suffix);
			if (existsSync(candidate)) return candidate;
		}
	}
	return null;
}

async function runInheritedProcess(commandName, args) {
	const invocation = buildProcessInvocation(commandName, args);
	const child = spawn(invocation.command, invocation.args, {
		cwd: repoRoot,
		env: process.env,
		stdio: "inherit",
	});
	return await new Promise((resolve, reject) => {
		child.once("error", reject);
		child.once("close", (exitCode) => resolve(exitCode ?? 1));
	});
}

function buildProcessInvocation(commandName, args) {
	if (process.platform === "win32" && isWindowsCommandScript(commandName)) {
		return {
			command: "cmd.exe",
			args: ["/d", "/s", "/c", quoteWindowsCommandLine([commandName, ...args])],
		};
	}
	return { command: commandName, args };
}

function isWindowsCommandScript(commandName) {
	const extension = path.extname(commandName).toLowerCase();
	return extension === ".cmd" || extension === ".bat";
}

function quoteWindowsCommandLine(args) {
	return args.map(quoteWindowsCommandArgument).join(" ");
}

function quoteWindowsCommandArgument(value) {
	if (value === "") return "\"\"";
	const escaped = value
		.replace(/(\\*)"/g, "$1$1\\\"")
		.replace(/(\\+)$/g, "$1$1");
	return /[\s"&|<>^()%!]/.test(value) ? "\"" + escaped + "\"" : escaped;
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
		"  execplan:build             Run Program-linked ExecPlans through the Ship by Sunday autonomous runner.",
		"  execplan:validate          Validate one ExecPlan with --plan <path>.",
		"  worker:test                Run the installed Worker tests through the root package script.",
		"  test                       Run the installed Worker tests directly.",
		"",
		"Start with README.md and docs/worker/install-report.md.",
	].join("\n");
}

async function lintPrograms() {
	const reports = [];
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (!/^\d{4}-\d{2}-\d{2}-.+/.test(path.basename(dir))) continue;
			const ref = toRef(dir);
			const issues = [];
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

async function lintExecPlans(args) {
	const requestedPlan = readArg(args, "--plan");
	const refs = requestedPlan ? [requestedPlan] : await listMarkdownRefs(["docs/exec-plans/active", "docs/exec-plans/completed"]);
	const reports = [];
	for (const ref of refs) {
		if (ref.endsWith("/index.md")) continue;
		const absolutePath = path.join(repoRoot, ref);
		const issues = [];
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

async function lintMarkdown(args) {
	const requestedPaths = readPathArgs(args);
	const roots = requestedPaths.length > 0 ? requestedPaths : ["docs/programs", "docs/exec-plans", "docs/prompts", "docs/worker"];
	const refs = await listMarkdownRefs(roots);
	const reports = [];
	for (const ref of refs) {
		const text = await readFile(path.join(repoRoot, ref), "utf8");
		const issues = [];
		if (text.includes("\r\n")) issues.push("File must use LF line endings.");
		if (!parseFrontmatter(text)) issues.push("Missing YAML frontmatter block.");
		reports.push({ ref, issues });
	}
	return reports;
}

async function writeChildPlan(args) {
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

function renderChildPlan(input) {
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
		"- ./scripts/run-worker.sh docs:validate",
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

function exitFromReports(reports) {
	for (const report of reports) {
		if (report.issues.length === 0) console.log(report.ref + ": ok");
		else console.log(report.ref + ":\n" + report.issues.map((issue) => "  - " + issue).join("\n"));
	}
	if (reports.some((report) => report.issues.length > 0)) process.exitCode = 1;
}

async function listDirs(rootRef) {
	const absoluteRoot = path.join(repoRoot, rootRef);
	const entries = await safeReaddirWithTypes(absoluteRoot);
	return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(absoluteRoot, entry.name));
}

async function listMarkdownRefs(rootRefs) {
	const refs = [];
	for (const rootRef of rootRefs) await collectMarkdownRefs(path.join(repoRoot, rootRef), refs);
	return refs.sort();
}

async function collectMarkdownRefs(absolutePath, refs) {
	const entries = await safeReaddirWithTypes(absolutePath);
	for (const entry of entries) {
		const childPath = path.join(absolutePath, entry.name);
		if (entry.isDirectory()) await collectMarkdownRefs(childPath, refs);
		else if (entry.isFile() && entry.name.endsWith(".md")) refs.push(toRef(childPath));
	}
}

async function safeReaddir(absolutePath) {
	try {
		return await readdir(absolutePath);
	} catch {
		return [];
	}
}

async function safeReaddirWithTypes(absolutePath) {
	try {
		return await readdir(absolutePath, { withFileTypes: true });
	} catch {
		return [];
	}
}

function parseFrontmatter(text) {
	const normalized = text.replaceAll("\r\n", "\n");
	if (!normalized.startsWith("---\n")) return null;
	const end = normalized.indexOf("\n---\n", 4);
	if (end === -1) return null;
	const metadata = new Map();
	for (const line of normalized.slice(4, end).split("\n")) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) metadata.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
	}
	return { metadata, body: normalized.slice(end + 5) };
}

async function findProgramDir(programId) {
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (path.basename(dir).endsWith("-" + programId)) return toRef(dir);
		}
	}
	throw new Error("No Program packet found for program_id: " + programId);
}

function readArg(args, name) {
	const index = args.indexOf(name);
	return index === -1 ? null : args[index + 1] ?? null;
}

function requireArg(args, name) {
	const value = readArg(args, name);
	if (!value || value.startsWith("--")) throw new Error("Missing value for " + name);
	return value;
}

function readPathArgs(args) {
	const paths = [];
	const index = args.indexOf("--paths");
	if (index === -1) return paths;
	for (const value of args.slice(index + 1)) {
		if (value.startsWith("--")) break;
		paths.push(value);
	}
	return paths;
}

function toRef(absolutePath) {
	return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}
`;
}

function workerSmokeTestSource() {
	return [
		'import assert from "node:assert/strict";',
		'import { existsSync } from "node:fs";',
		'import path from "node:path";',
		'import { test } from "node:test";',
		'import { fileURLToPath } from "node:url";',
		"",
		'const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");',
		"",
		'test("Worker Foundations install includes the Worker manifest", () => {',
		'\tassert.equal(existsSync(path.join(repoRoot, "apps/worker/worker-manifest.json")), true);',
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
	const execPlanBuildCommand = packageRunCommand(
		packageManager,
		"execplan:build",
	);
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
		`- Run the autonomous ExecPlan loop: \`${execPlanBuildCommand} -- --program-id worker-foundations-adoption\``,
		`- Run Worker tests: \`${workerTestCommand}\``,
		"- Show direct Worker commands: `./scripts/run-worker.sh --help`",
		"- Direct fallback for any Worker command: `./scripts/run-worker.sh <command>`",
		"",
		"### Command Surface",
		"",
		`- Programs: \`${programsLintCommand}\``,
		`- ExecPlans: \`${plansLintCommand}\``,
		`- Autonomous ExecPlan build: \`${execPlanBuildCommand} -- --program-id <program-id>\``,
		"- Runner resolution: `execplan:build` uses `SHIPBYSUNDAY_CLI`, a local `ship-by-sunday`/`shipbysunday` binary, or an `npx`/`npm exec` package fallback.",
		"- Package override: set `SHIPBYSUNDAY_PACKAGE_SPEC` to a tarball, folder, or package spec when the default `ship-by-sunday` package source is unavailable.",
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
		`- Prefer repo-native Worker commands such as \`${packageRunCommand(packageManager, "execplan:build")} -- --program-id <program-id>\`, \`${packageRunCommand(packageManager, "docs:validate")}\`, and \`${packageRunCommand(packageManager, "worker:test")}\`.`,
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
		packageManager: `npm@${WORKER_DEFAULT_NPM_VERSION}`,
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
		if (packageManager.startsWith("bun@")) return "npm";
		if (packageManager.startsWith("pnpm@")) return "pnpm";
		if (packageManager.startsWith("yarn@")) return "yarn";
		if (packageManager.startsWith("npm@")) return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) return "yarn";
	if (existsSync(path.join(repositoryRoot, "npm-shrinkwrap.json")))
		return "npm";
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) return "npm";
	return "npm";
}

function hasRootPackageManagerLockfile(repositoryRoot: string) {
	return (
		existsSync(path.join(repositoryRoot, "pnpm-lock.yaml")) ||
		existsSync(path.join(repositoryRoot, "yarn.lock")) ||
		existsSync(path.join(repositoryRoot, "npm-shrinkwrap.json")) ||
		existsSync(path.join(repositoryRoot, "package-lock.json"))
	);
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

async function isGitTrackedRef(repositoryRoot: string, ref: string) {
	return (
		await runGit(repositoryRoot, ["ls-files", "--error-unmatch", "--", ref])
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

function inspectManagedBlockMarkers(content: string) {
	const normalized = normalizeManagedContent(content);
	const startIndexes = markerIndexes(normalized, ROOT_AGENT_START);
	const endIndexes = markerIndexes(normalized, ROOT_AGENT_END);
	if (startIndexes.length === 0 && endIndexes.length === 0) {
		return "none" as const;
	}
	if (startIndexes.length === 0 || endIndexes.length === 0) {
		return "incomplete" as const;
	}
	if (startIndexes.length !== 1 || endIndexes.length !== 1) {
		return "duplicate" as const;
	}
	return endIndexes[0] < startIndexes[0]
		? ("incomplete" as const)
		: ("single" as const);
}

function markerIndexes(content: string, marker: string) {
	const indexes: number[] = [];
	let searchIndex = 0;
	while (searchIndex < content.length) {
		const index = content.indexOf(marker, searchIndex);
		if (index === -1) {
			break;
		}
		indexes.push(index);
		searchIndex = index + marker.length;
	}
	return indexes;
}

function replaceOrAppendManagedBlock({
	currentContent,
	managedBlock,
}: {
	currentContent: string;
	managedBlock: string;
}) {
	const normalized = normalizeManagedContent(currentContent);
	const markerStatus = inspectManagedBlockMarkers(normalized);
	if (markerStatus === "duplicate") {
		throw new Error("Existing file has duplicate Worker managed markers.");
	}
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	if (startIndex === -1 && endIndex === -1) {
		return `${normalized.trimEnd()}\n\n${managedBlock}\n`;
	}
	if (markerStatus === "incomplete") {
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
