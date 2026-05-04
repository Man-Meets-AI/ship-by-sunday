import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { appendFile, readFile, rename, writeFile } from "node:fs/promises";
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
			eventType: "runner.revoked";
			reason?: string;
	  };

export type RunnerEvent = {
	eventId: string;
	projectId: string;
	runnerId: string;
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

export function createRunnerEvent({
	projectId,
	runnerId,
	payload,
	createdAt = Date.now(),
}: {
	projectId: string;
	runnerId: string;
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
) {
	assertSyncSafeRunnerEvent(event);
	await ensureLocalProjectStateDirectory(repositoryRoot);
	await appendFile(
		eventOutboxPath(repositoryRoot),
		`${JSON.stringify(event)}\n`,
	);
}

export async function readQueuedRunnerEvents(repositoryRoot: string) {
	const outboxPath = eventOutboxPath(repositoryRoot);
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

async function writeQueuedRunnerEvents(
	repositoryRoot: string,
	events: RunnerEvent[],
) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const outboxPath = eventOutboxPath(repositoryRoot);
	const temporaryPath = `${outboxPath}.${process.pid}.tmp`;
	const contents = events.length
		? `${events.map((event) => JSON.stringify(event)).join("\n")}\n`
		: "";
	await writeFile(temporaryPath, contents);
	await rename(temporaryPath, outboxPath);
}

export async function flushRunnerEvents({
	repositoryRoot,
	credential,
	fetchRunnerEvent = fetch,
}: {
	repositoryRoot: string;
	credential: RunnerCredential;
	fetchRunnerEvent?: typeof fetch;
}): Promise<RunnerEventFlushResult> {
	const queuedEvents = await readQueuedRunnerEvents(repositoryRoot);
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

	await writeQueuedRunnerEvents(repositoryRoot, remainingEvents);
	return {
		delivered,
		remaining: remainingEvents.length,
	};
}
