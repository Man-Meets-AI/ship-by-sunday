import { existsSync } from "node:fs";
import path from "node:path";

import { applyShipbysundayWorkerCodexConfigPatch } from "../../core/codex-config-manager";
import { resolveRepositoryRoot } from "../../core/repository-root";
import { WORKER_FOUNDATIONS_INSTALL_BRANCH } from "./manifest";
import { INSTALL_REPORT_REF, STARTER_CHILD_PLAN_REF } from "./constants";
import { applyWorkerFoundations, prepareInstallBranch } from "./apply";
import { confirmInstall } from "./confirmation";
import { resolveWorkerHome } from "./env";
import { inspectTargetRepository } from "./inspection";
import {
	amendTrackedInstallReport,
	buildSkippedKickoff,
	commitInstallChanges,
	maybeRunKickoff,
} from "./kickoff";
import {
	activateWorkerLicense,
	shouldAttemptInteractiveLicenseActivation,
} from "./license";
import { addPlanBlocker, buildInstallPlan } from "./plan";
import {
	runDogfoodChildPlan,
	runProofCommands,
	writeLocalProof,
} from "./proof";
import { buildReport, writeTrackedInstallReport } from "./report";
import {
	blockedResult,
	buildBlockedPlan,
	finishAndMaybeSyncResult,
} from "./result";
import type {
	WorkerInstallContext,
	WorkerInstallOptions,
	WorkerInstallResult,
} from "./types";
import { rollbackWorkerCodexConfig } from "./utils";

export type { WorkerInstallOptions, WorkerInstallResult } from "./types";

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
