import "server-only";

import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type {
	ImpersonationAuditEventType,
	ImpersonationBlockReason,
} from "@/convex/impersonation/types";
import type { SupportModeStatus } from "@/platform/admin-impersonation";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import { getRequestIdFromRequest } from "@/platform/observability/request-id";

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
			requestId: getRequestIdFromRequest(request),
			userAgent: request.headers.get("user-agent"),
			ipHash: null,
		},
		{ token: session.token },
	);

	return result.kind !== "not_impersonating";
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

	await fetchMutation(
		api.impersonation.recordSupportModeDownloadAttempt,
		{
			actionId: input.actionId,
			result: "blocked",
			blockReason: getSupportModeRouteBlockReason(status),
			changedRecordIds: null,
			requestId: getRequestIdFromRequest(request),
			userAgent: request.headers.get("user-agent"),
			ipHash: null,
		},
		{ token: session.token },
	);

	return { kind: "blocked" as const };
}
