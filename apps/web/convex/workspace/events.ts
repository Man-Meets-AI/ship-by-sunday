import { ConvexError } from "convex/values";

import type {
	WorkspaceRunnerEventPayload,
	WorkspaceRunnerEventType,
} from "./types";

const EVENT_SCHEMA_VERSION = "workspace.runner-event.v1" as const;

const unsafePayloadFieldNames = new Set(
	[
		"absolutePath",
		"apiKey",
		"authJson",
		"code",
		"codeSnippet",
		"codexTranscript",
		"env",
		"environment",
		"fullLog",
		"localAbsolutePath",
		"log",
		"logs",
		"markdown",
		"markdownReport",
		"rawLog",
		"rawLogs",
		"rawSource",
		"rawSourceFile",
		"screenshot",
		"screenshots",
		"secret",
		"secrets",
		"source",
		"sourceExcerpt",
		"terminalLog",
		"terminalLogs",
		"token",
		"transcript",
	].map((fieldName) => normalizeFieldName(fieldName)),
);

const eventPayloadFieldsByType: Record<
	WorkspaceRunnerEventType,
	Set<string>
> = {
	"runner.paired": new Set([
		"eventType",
		"pairingStatus",
		"runnerMode",
		"machineDisplayName",
		"runnerVersion",
	]),
	"runner.heartbeat": new Set([
		"eventType",
		"runnerMode",
		"status",
		"machineHealthStatus",
		"projectHealthStatus",
	]),
	"setup.check.started": new Set(["eventType", "scope", "checkKey", "summary"]),
	"setup.check.completed": new Set([
		"eventType",
		"scope",
		"checkKey",
		"status",
		"summary",
		"remediationAction",
	]),
	"doctor.stage.started": new Set(["eventType", "stage"]),
	"doctor.probe.completed": new Set([
		"eventType",
		"probeId",
		"status",
		"durationMs",
		"sensitivity",
		"summary",
		"blockedReason",
	]),
	"doctor.sync_preview.ready": new Set([
		"eventType",
		"previewDigest",
		"findingsCount",
		"excludedArtifactCount",
		"localReportRef",
		"expiresAt",
	]),
	"doctor.findings.approved": new Set([
		"eventType",
		"previewDigest",
		"approvedFindingsCount",
	]),
	"workflow.approval.requested": new Set([
		"eventType",
		"workflowId",
		"findingId",
		"requiredPermission",
		"summary",
	]),
	"workflow.started": new Set([
		"eventType",
		"workflowId",
		"branchName",
		"profileName",
	]),
	"workflow.proof.completed": new Set([
		"eventType",
		"workflowId",
		"proofStatus",
		"proofSummary",
	]),
	"workflow.blocked": new Set([
		"eventType",
		"workflowId",
		"blockedStage",
		"blockedReason",
	]),
	"runner.revoked": new Set(["eventType", "reason"]),
};

export function getWorkspaceRunnerEventSchemaVersion(): typeof EVENT_SCHEMA_VERSION {
	return EVENT_SCHEMA_VERSION;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFieldName(fieldName: string) {
	return fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const embeddedLocalAbsolutePathPatterns = [
	/(^|[\s"'`([{<:=])~[\\/][^\s"'`)\]}>]+/,
	/(^|[\s"'`([{<:=])\/(?:Users|home|private|tmp|var\/folders|Volumes|workspace|workspaces|mnt|repo|repos)[\\/][^\s"'`)\]}>]*/i,
	/(^|[\s"'`([{<:=])[A-Za-z]:[\\/][^\s"'`)\]}>]+/,
	/(^|[\s"'`([{<:=])\\\\[^\\\s"'`)\]}>]+\\[^\\\s"'`)\]}>]+/,
];

function looksLikeLocalAbsolutePath(value: string) {
	if (value.startsWith("~/") || value.startsWith("/")) {
		return true;
	}

	if (/^[A-Za-z]:[\\/]/.test(value)) {
		return true;
	}

	if (value.startsWith("\\\\")) {
		return true;
	}

	return embeddedLocalAbsolutePathPatterns.some((pattern) =>
		pattern.test(value),
	);
}

function looksLikeSecretValue(value: string) {
	return (
		/(sk_(live|test)_[A-Za-z0-9]{8,})/.test(value) ||
		/(gh[pousr]_[A-Za-z0-9_]{8,})/.test(value) ||
		/(xox[baprs]-[A-Za-z0-9-]{8,})/.test(value) ||
		/BEGIN [A-Z ]*PRIVATE KEY/.test(value) ||
		/[A-Z0-9_]*(API_KEY|SECRET|TOKEN)=/.test(value)
	);
}

export function assertSyncSafeText(value: string, context: string) {
	if (value.length > 8000) {
		throw new ConvexError(`${context} is too large to sync safely`);
	}

	if (looksLikeLocalAbsolutePath(value)) {
		throw new ConvexError(`${context} must not contain a local absolute path`);
	}

	if (looksLikeSecretValue(value)) {
		throw new ConvexError(`${context} must not contain secret material`);
	}
}

export function assertSyncSafeValue(value: unknown, context: string) {
	if (typeof value === "string") {
		assertSyncSafeText(value, context);
		return;
	}

	if (
		value === null ||
		value === undefined ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return;
	}

	if (Array.isArray(value)) {
		if (value.length > 128) {
			throw new ConvexError(`${context} has too many entries to sync safely`);
		}

		value.forEach((item, index) => {
			assertSyncSafeValue(item, `${context}[${index}]`);
		});
		return;
	}

	if (!isRecord(value)) {
		throw new ConvexError(`${context} contains an unsupported value`);
	}

	for (const [fieldName, fieldValue] of Object.entries(value)) {
		if (unsafePayloadFieldNames.has(normalizeFieldName(fieldName))) {
			throw new ConvexError(`${context}.${fieldName} is not sync-safe`);
		}

		assertSyncSafeValue(fieldValue, `${context}.${fieldName}`);
	}
}

export function assertWorkspaceRunnerEventPayload(
	eventType: WorkspaceRunnerEventType,
	payload: WorkspaceRunnerEventPayload,
) {
	if (!isRecord(payload)) {
		throw new ConvexError("Runner event payload must be an object");
	}

	if (payload.eventType !== eventType) {
		throw new ConvexError("Runner event payload type does not match eventType");
	}

	const allowedFields = eventPayloadFieldsByType[eventType];
	for (const fieldName of Object.keys(payload)) {
		if (!allowedFields.has(fieldName)) {
			throw new ConvexError(
				`Runner event payload field ${fieldName} is not supported`,
			);
		}
	}

	assertSyncSafeValue(payload, "payload");
}
