import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { fetchMutation } from "convex/nextjs";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
	WorkspaceRunnerEventPayload,
	WorkspaceRunnerEventType,
} from "@/convex/workspace/types";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";

const RUNNER_TOKEN_PREFIX = "sbs_run_";
const VALID_RUNNER_MODES = new Set(["daemon", "one_shot"]);

function readErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

function getString(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(value: unknown) {
	const text = getString(value);
	return text.length > 0 ? text : undefined;
}

function getRunnerMode(value: unknown) {
	const mode = getString(value);
	return VALID_RUNNER_MODES.has(mode) ? (mode as "daemon" | "one_shot") : null;
}

function normalizeRunnerEventBody(body: Record<string, unknown> | null) {
	const eventId = getString(body?.eventId);
	const projectId = getString(body?.projectId);
	const runnerId = getString(body?.runnerId);
	const eventType = getString(body?.eventType);
	const schemaVersion = getString(body?.schemaVersion);
	const createdAt = body?.createdAt;
	const payload = body?.payload;
	if (
		!eventId ||
		!projectId ||
		!runnerId ||
		!eventType ||
		schemaVersion !== "workspace.runner-event.v1" ||
		typeof createdAt !== "number" ||
		!payload ||
		typeof payload !== "object" ||
		Array.isArray(payload)
	) {
		return null;
	}

	return {
		eventId,
		projectId: projectId as Id<"workspaceProjects">,
		runnerId: runnerId as Id<"workspaceRunnerBindings">,
		doctorPassRunId: getOptionalString(body?.doctorPassRunId) as
			| Id<"doctorPassRuns">
			| undefined,
		workflowRunId: getOptionalString(body?.workflowRunId) as
			| Id<"workflowRuns">
			| undefined,
		eventType: eventType as WorkspaceRunnerEventType,
		schemaVersion: "workspace.runner-event.v1" as const,
		createdAt,
		payload: payload as WorkspaceRunnerEventPayload,
	};
}

async function readJsonObject(request: Request) {
	try {
		const body = await request.json();
		return body && typeof body === "object" && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

function createRunnerToken() {
	return `${RUNNER_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

function hashRunnerToken(runnerToken: string) {
	return `sha256:${createHash("sha256").update(runnerToken).digest("hex")}`;
}

function getBearerToken(request: Request) {
	const authorization = request.headers.get("authorization") ?? "";
	const [scheme, token] = authorization.split(/\s+/, 2);
	if (
		scheme.toLowerCase() !== "bearer" ||
		!token?.startsWith(RUNNER_TOKEN_PREFIX)
	) {
		return null;
	}

	return token;
}

export async function pairWorkspaceRunnerFromRequest(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const body = await readJsonObject(request);
	const pairingToken = getString(body?.pairingToken);
	const runnerMode = getRunnerMode(body?.runnerMode ?? "daemon");

	if (!pairingToken || !runnerMode) {
		return jsonWithRequestId(
			{
				error: "pairingToken and a valid runnerMode are required.",
				requestId,
			},
			{ status: 400 },
			requestId,
		);
	}

	const runnerToken = createRunnerToken();
	const runnerCredentialHash = hashRunnerToken(runnerToken);

	try {
		const result = await fetchMutation(
			api.workspace.bindWorkspaceRunnerByPairingToken,
			{
				pairingToken,
				runnerCredentialHash,
				runnerMode,
				runnerLabel: getOptionalString(body?.runnerLabel),
				machineDisplayName: getOptionalString(body?.machineDisplayName),
				runnerVersion: getOptionalString(body?.runnerVersion),
			},
		);

		return jsonWithRequestId(
			{
				...result,
				runnerToken,
				eventEndpoint: apiRouteConfig.workspaceRunnerEvents,
			},
			undefined,
			requestId,
		);
	} catch (error) {
		return jsonWithRequestId(
			{
				error: readErrorMessage(error),
				requestId,
			},
			{ status: 401 },
			requestId,
		);
	}
}

export async function ingestWorkspaceRunnerEventFromRequest(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const runnerToken = getBearerToken(request);
	if (!runnerToken) {
		return jsonWithRequestId(
			{
				error: "Runner bearer token is required.",
				requestId,
			},
			{ status: 401 },
			requestId,
		);
	}

	const body = await readJsonObject(request);
	const eventBody = normalizeRunnerEventBody(body);
	if (!eventBody) {
		return jsonWithRequestId(
			{
				error: "Runner event payload is required.",
				requestId,
			},
			{ status: 400 },
			requestId,
		);
	}

	try {
		const result = await fetchMutation(
			api.workspace.ingestWorkspaceRunnerEventByCredential,
			{
				runnerCredentialHash: hashRunnerToken(runnerToken),
				...eventBody,
			},
		);

		return jsonWithRequestId(result, undefined, requestId);
	} catch (error) {
		return jsonWithRequestId(
			{
				error: readErrorMessage(error),
				requestId,
			},
			{ status: 401 },
			requestId,
		);
	}
}
