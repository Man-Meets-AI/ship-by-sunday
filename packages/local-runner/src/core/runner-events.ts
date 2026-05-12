import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import {
	appendFile,
	open,
	readFile,
	rename,
	rm,
	unlink,
} from "node:fs/promises";
import path from "node:path";

import type { RunnerCredential } from "./local-runner-home";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import { assertSyncSafeValue } from "./redaction";

export const RUNNER_EVENT_SCHEMA_VERSION = "workspace.runner-event.v1" as const;

export type SetupCheckStatus = "unknown" | "blocked" | "warning" | "ready";
export type RunnerEventType =
	| "runner.paired"
	| "runner.heartbeat"
	| "setup.check.started"
	| "setup.check.completed"
	| "worker.install.previewed"
	| "worker.install.completed"
	| "worker.install.blocked"
	| "doctor.stage.started"
	| "doctor.probe.completed"
	| "doctor.sync_preview.ready"
	| "workflow.started"
	| "workflow.proof.completed"
	| "workflow.blocked"
	| "runner.revoked";

export type RunnerEventPayload =
	| {
			eventType: "runner.paired";
			pairingStatus:
				| "waiting"
				| "runner_detected"
				| "verifying_machine"
				| "verifying_project"
				| "paired"
				| "revoked";
			runnerMode: "daemon" | "one_shot";
			machineDisplayName?: string;
			runnerVersion?: string;
			repositoryDisplayName?: string;
	  }
	| {
			eventType: "runner.heartbeat";
			runnerMode: "daemon" | "one_shot";
			status: "online" | "degraded";
			machineHealthStatus: SetupCheckStatus;
			projectHealthStatus: SetupCheckStatus;
	  }
	| {
			eventType: "setup.check.started";
			scope: "machine" | "project";
			checkKey: string;
			summary?: string;
	  }
	| {
			eventType: "setup.check.completed";
			scope: "machine" | "project";
			checkKey: string;
			status: SetupCheckStatus;
			summary: string;
			remediationAction?: string;
	  }
	| {
			eventType: "worker.install.previewed";
			outcome: "ready";
			status: "ready";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "worker.install.completed";
			outcome: "installed";
			status: "installed";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "worker.install.blocked";
			outcome: "blocked" | "failed" | "cancelled";
			status: "blocked" | "failed" | "cancelled";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			blockerIds: string[];
			blockerReasons: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "doctor.stage.started";
			stage:
				| "runner_connected"
				| "machine_setup_checked"
				| "project_setup_checked"
				| "passive_probes_running"
				| "codex_interpretation_running"
				| "sync_preview_ready"
				| "findings_ready";
	  }
	| {
			eventType: "doctor.probe.completed";
			probeId: string;
			status: "completed" | "blocked" | "failed";
			durationMs: number;
			sensitivity: "local_only" | "sync_safe";
			summary: string;
			blockedReason?: string;
	  }
	| {
			eventType: "doctor.sync_preview.ready";
			previewDigest: string;
			findingsCount: number;
			excludedArtifactCount: number;
			localReportRef: string;
			expiresAt?: number;
	  }
	| {
			eventType: "workflow.started";
			workflowId: string;
			branchName?: string;
			profileName?: string;
	  }
	| {
			eventType: "workflow.proof.completed";
			workflowId: string;
			writeLeaseId: string;
			proofStatus: "not_started" | "passed" | "failed" | "blocked";
			proofSummary: string;
			touchedFileRefs?: string[];
			createdArtifactRefs?: string[];
			proofCommandResults?: Array<{
				commandName: string;
				status: "passed" | "failed" | "blocked";
			}>;
			nextRecommendedWorkflowId?: string;
	  }
	| {
			eventType: "workflow.blocked";
			workflowId: string;
			writeLeaseId: string;
			blockedStage: string;
			blockedReason: string;
	  }
	| {
			eventType: "runner.revoked";
			reason?: string;
	  };

export type WorkerInstallProofCommandResult = {
	commandLabel: string;
	status: "passed" | "failed" | "blocked" | "skipped";
};

export type RunnerEvent = {
	eventId: string;
	projectId: string;
	runnerId: string;
	doctorPassRunId?: string;
	workflowRunId?: string;
	eventType: RunnerEventType;
	schemaVersion: typeof RUNNER_EVENT_SCHEMA_VERSION;
	createdAt: number;
	payload: RunnerEventPayload;
};

export type RunnerEventFlushResult = {
	delivered: number;
	remaining: number;
};

function eventOutboxPath(repositoryRoot: string) {
	return path.join(repositoryRoot, ".sbs", "events", "outbox.jsonl");
}

function eventOutboxLockPath(repositoryRoot: string) {
	return path.join(repositoryRoot, ".sbs", "events", "outbox.lock");
}

export function createRunnerEvent({
	projectId,
	runnerId,
	doctorPassRunId,
	workflowRunId,
	payload,
	createdAt = Date.now(),
}: {
	projectId: string;
	runnerId: string;
	doctorPassRunId?: string;
	workflowRunId?: string;
	payload: RunnerEventPayload;
	createdAt?: number;
}): RunnerEvent {
	if (payload.eventType === "runner.revoked") {
		throw new Error(
			"runner.revoked must be sent only by explicit revoke flows.",
		);
	}

	const event = {
		eventId: `evt_${randomUUID()}`,
		projectId,
		runnerId,
		doctorPassRunId,
		workflowRunId,
		eventType: payload.eventType,
		schemaVersion: RUNNER_EVENT_SCHEMA_VERSION,
		createdAt,
		payload,
	};
	assertSyncSafeRunnerEvent(event);
	return event;
}

export function assertSyncSafeRunnerEvent(event: RunnerEvent) {
	if (event.payload.eventType !== event.eventType) {
		throw new Error("Runner event payload type does not match eventType.");
	}
	assertSyncSafeValue(event, "runner event");
}

export async function queueRunnerEvent(
	repositoryRoot: string,
	event: RunnerEvent,
	options: { updateGitExclude?: boolean } = {},
) {
	assertSyncSafeRunnerEvent(event);
	await ensureLocalProjectStateDirectory(repositoryRoot, {
		updateGitExclude: options.updateGitExclude ?? true,
	});
	await appendFile(
		eventOutboxPath(repositoryRoot),
		`${JSON.stringify(event)}\n`,
	);
}

export async function readQueuedRunnerEvents(repositoryRoot: string) {
	return await readQueuedRunnerEventsFromPath(eventOutboxPath(repositoryRoot));
}

async function appendQueuedRunnerEvents(
	repositoryRoot: string,
	events: RunnerEvent[],
	options: { updateGitExclude?: boolean } = {},
) {
	if (events.length === 0) {
		return;
	}
	await ensureLocalProjectStateDirectory(repositoryRoot, {
		updateGitExclude: options.updateGitExclude ?? true,
	});
	const outboxPath = eventOutboxPath(repositoryRoot);
	await appendFile(
		outboxPath,
		`${events.map((event) => JSON.stringify(event)).join("\n")}\n`,
	);
}

export async function flushRunnerEvents({
	repositoryRoot,
	credential,
	fetchRunnerEvent = fetch,
	updateGitExclude = true,
}: {
	repositoryRoot: string;
	credential: RunnerCredential;
	fetchRunnerEvent?: typeof fetch;
	updateGitExclude?: boolean;
}): Promise<RunnerEventFlushResult> {
	await ensureLocalProjectStateDirectory(repositoryRoot, { updateGitExclude });
	const lockPath = eventOutboxLockPath(repositoryRoot);
	let lockHandle;
	try {
		lockHandle = await open(lockPath, "wx");
	} catch (error) {
		const code = (error as { code?: string }).code;
		if (code === "EEXIST") {
			return {
				delivered: 0,
				remaining: (await readQueuedRunnerEvents(repositoryRoot)).length,
			};
		}
		throw error;
	}

	const outboxPath = eventOutboxPath(repositoryRoot);
	const flushingPath = `${outboxPath}.${process.pid}.${Date.now()}.flushing`;
	let queuedEvents: RunnerEvent[] = [];
	try {
		try {
			await rename(outboxPath, flushingPath);
		} catch (error) {
			const code = (error as { code?: string }).code;
			if (code !== "ENOENT") {
				throw error;
			}
			return { delivered: 0, remaining: 0 };
		}

		queuedEvents = await readQueuedRunnerEventsFromPath(flushingPath);
	} finally {
		await lockHandle.close();
		await unlink(lockPath).catch(() => undefined);
	}

	const remainingEvents: RunnerEvent[] = [];
	let delivered = 0;

	for (const event of queuedEvents) {
		const response = await fetchRunnerEvent(
			new URL(credential.eventEndpoint, credential.apiBaseUrl),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${credential.runnerToken}`,
				},
				body: JSON.stringify(event),
			},
		).catch(() => null);

		if (response?.ok) {
			delivered += 1;
			continue;
		}

		remainingEvents.push(event);
	}

	await appendQueuedRunnerEvents(repositoryRoot, remainingEvents, {
		updateGitExclude,
	});
	await rm(flushingPath, { force: true });
	return {
		delivered,
		remaining: remainingEvents.length,
	};
}

async function readQueuedRunnerEventsFromPath(outboxPath: string) {
	if (!existsSync(outboxPath)) {
		return [];
	}

	const contents = await readFile(outboxPath, "utf8");
	return contents
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => JSON.parse(line) as RunnerEvent);
}
