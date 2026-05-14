import path from "node:path";

import { Effect, Layer } from "effect";

import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../../effect/runtime";
import type { JsonValue } from "../../core/json-value";
import {
	type LocalRunnerHomeService,
	NodeLocalRunnerHomeServiceLive,
	readRunnerCredentialEffect,
	resolveLocalRunnerHome,
} from "../../core/local-runner-home";
import { assertSyncSafeValue } from "../../core/redaction";
import {
	createRunnerEvent,
	flushRunnerEventsEffect,
	NodeRunnerEventServiceLive,
	queueRunnerEventEffect,
	type RunnerEventService,
	type RunnerEventPayload,
} from "../../core/runner-events";
import { resolveWorkerHome } from "./env";
import { buildSkippedKickoff } from "./kickoff";
import {
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
} from "./manifest";
import { buildPrivacyBoundary } from "./privacy";
import { buildReport } from "./report";
import type {
	FinishResultInput,
	RootPackageManager,
	WorkerInstallBlocker,
	WorkerInstallContext,
	WorkerInstallOptions,
	WorkerInstallPlan,
	WorkerInstallResult,
} from "./types";

export async function finishAndMaybeSyncResult(
	input: FinishResultInput,
): Promise<WorkerInstallResult> {
	return await runLocalRunnerEffect(
		finishAndMaybeSyncResultEffect(input).pipe(
			Effect.provide(
				Layer.merge(NodeLocalRunnerHomeServiceLive, NodeRunnerEventServiceLive),
			),
		),
	);
}

export function finishAndMaybeSyncResultEffect(
	input: FinishResultInput,
): Effect.Effect<
	WorkerInstallResult,
	Error,
	LocalRunnerHomeService | RunnerEventService
> {
	return Effect.flatMap(
		Effect.try({
			try: () => finishResult(input),
			catch: normalizeLocalRunnerEffectError,
		}),
		(result) =>
			Effect.flatMap(
				Effect.catchAll(
					emitWorkerInstallRunnerEventEffect({
						context: input.context,
						result,
					}),
					() => Effect.void,
				),
				() => Effect.succeed(result),
			),
	);
}

function emitWorkerInstallRunnerEventEffect({
	context,
	result,
}: {
	context: WorkerInstallContext;
	result: WorkerInstallResult;
}) {
	const payload = buildWorkerInstallRunnerEventPayload(result);
	if (!payload) {
		return Effect.void;
	}

	return Effect.flatMap(
		readRunnerCredentialEffect({
			repositoryRoot: context.repositoryRoot,
			runnerHome: resolveLocalRunnerHome(context.env),
		}),
		(credential) => {
			if (!credential) {
				return Effect.void;
			}

			const event = createRunnerEvent({
				projectId: credential.projectId,
				runnerId: credential.runnerId,
				payload,
			});
			return Effect.flatMap(
				queueRunnerEventEffect(context.repositoryRoot, event),
				() =>
					Effect.asVoid(
						flushRunnerEventsEffect({
							repositoryRoot: context.repositoryRoot,
							credential,
						}),
					),
			);
		},
	);
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

export function blockedResult({
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

export function buildBlockedPlan({
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
