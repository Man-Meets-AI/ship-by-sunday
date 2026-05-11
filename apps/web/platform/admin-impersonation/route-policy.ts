import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type {
	ImpersonationAuditEventType,
	ImpersonationBlockReason,
} from "@/convex/impersonation/types";
import {
	createSupportModeRouteAuditPayload,
	type SupportModeRouteAuditAssertion,
	type SupportModeRouteAuditPurpose,
	type SupportModeStatus,
} from "@/platform/admin-impersonation";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import { serverEnv } from "@/platform/env/server";
import { getRequestIdFromRequest } from "@/platform/observability/request-id";

function getRouteAuditSecret() {
	const secret =
		serverEnv.ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET ??
		serverEnv.CLERK_SECRET_KEY;
	if (!secret) {
		throw new Error("Missing admin impersonation route audit secret.");
	}

	return secret;
}

function createRouteAuditServerAssertion(input: {
	purpose: SupportModeRouteAuditPurpose;
	actionId: string;
	eventType?: ImpersonationAuditEventType | null;
	result?: "success" | "blocked" | null;
	blockReason?: ImpersonationBlockReason | null;
	changedRecordIds?: string[] | null;
}): SupportModeRouteAuditAssertion {
	const issuedAt = Date.now();
	const nonce = randomUUID();
	const payload = createSupportModeRouteAuditPayload({
		...input,
		issuedAt,
		nonce,
	});

	return {
		issuedAt,
		nonce,
		payload,
		signature: createHmac("sha256", getRouteAuditSecret())
			.update(payload)
			.digest("hex"),
	};
}

function supportModeStatusIsDownloadBlocking(status: SupportModeStatus) {
	return (
		status.state === "expired" ||
		status.state === "stopped" ||
		status.state === "invalid_mismatch" ||
		status.state === "misconfigured" ||
		status.state === "kill_switch_disabled" ||
		status.state === "unsupported_clerk_dashboard_impersonation"
	);
}

function getSupportModeRouteBlockReason(
	status: SupportModeStatus,
): ImpersonationBlockReason {
	if (status.state === "expired") {
		return "support_session_expired";
	}
	if (status.state === "invalid_mismatch") {
		return "support_session_mismatch";
	}
	if (status.state === "unsupported_clerk_dashboard_impersonation") {
		return "unsupported_clerk_dashboard_impersonation";
	}
	if (status.state === "misconfigured") {
		return "external_side_effect_blocked";
	}
	return "external_side_effect_blocked";
}

function requireRecordedSupportModeRouteAudit(
	result: { kind: "recorded" | "not_impersonating" | "not_recorded" },
	actionId: string,
) {
	if (result.kind !== "recorded") {
		throw new Error(
			`Support-mode route audit was not recorded before blocking ${actionId}.`,
		);
	}
}

export async function recordBlockedSupportModeActionForRequest(
	request: Request,
	input: {
		actionId: string;
		blockReason: ImpersonationBlockReason;
		eventType?: ImpersonationAuditEventType;
	},
) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return false;
	}

	const result = await fetchMutation(
		api.impersonation.recordBlockedSupportModeAction,
		{
			actionId: input.actionId,
			blockReason: input.blockReason,
			eventType: input.eventType ?? "external_action_blocked",
			serverAssertion: createRouteAuditServerAssertion({
				purpose: "blocked_action",
				actionId: input.actionId,
				eventType: input.eventType ?? "external_action_blocked",
				result: "blocked",
				blockReason: input.blockReason,
			}),
			requestId: getRequestIdFromRequest(request),
			userAgent: request.headers.get("user-agent"),
			ipHash: null,
		},
		{ token: session.token },
	);

	if (result.kind === "not_impersonating") {
		return false;
	}
	requireRecordedSupportModeRouteAudit(result, input.actionId);
	return true;
}

export async function recordSupportModeDownloadForRequest(
	request: Request,
	input: { actionId: string; changedRecordIds?: string[] },
) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return { kind: "not_impersonating" as const };
	}

	return await fetchMutation(
		api.impersonation.recordSupportModeDownloadAttempt,
		{
			actionId: input.actionId,
			result: "success",
			changedRecordIds: input.changedRecordIds ?? null,
			serverAssertion: createRouteAuditServerAssertion({
				purpose: "download_attempt",
				actionId: input.actionId,
				result: "success",
				changedRecordIds: input.changedRecordIds ?? null,
			}),
			requestId: getRequestIdFromRequest(request),
			userAgent: request.headers.get("user-agent"),
			ipHash: null,
		},
		{ token: session.token },
	);
}

export async function assertSupportModeDownloadAllowedForRequest(
	request: Request,
	input: { actionId: string },
) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return { kind: "not_impersonating" as const };
	}

	const status = await fetchMutation(
		api.impersonation.observeSupportModeStatus,
		{},
		{ token: session.token },
	);
	if (status.state === "active") {
		return { kind: "allowed" as const };
	}
	if (!supportModeStatusIsDownloadBlocking(status)) {
		return { kind: "not_impersonating" as const };
	}

	const auditResult = await fetchMutation(
		api.impersonation.recordSupportModeDownloadAttempt,
		{
			actionId: input.actionId,
			result: "blocked",
			blockReason: getSupportModeRouteBlockReason(status),
			changedRecordIds: null,
			serverAssertion: createRouteAuditServerAssertion({
				purpose: "download_attempt",
				actionId: input.actionId,
				result: "blocked",
				blockReason: getSupportModeRouteBlockReason(status),
				changedRecordIds: null,
			}),
			requestId: getRequestIdFromRequest(request),
			userAgent: request.headers.get("user-agent"),
			ipHash: null,
		},
		{ token: session.token },
	);
	requireRecordedSupportModeRouteAudit(auditResult, input.actionId);

	return { kind: "blocked" as const };
}
