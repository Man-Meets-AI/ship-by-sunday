export const ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET_ENV =
	"ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET" as const;

export const SUPPORT_MODE_ROUTE_AUDIT_ASSERTION_VERSION =
	"support-mode-route-audit.v1" as const;

export type SupportModeRouteAuditPurpose =
	| "blocked_action"
	| "download_attempt";

export type SupportModeRouteAuditAssertion = {
	issuedAt: number;
	nonce: string;
	payload: string;
	signature: string;
};

type SupportModeRouteAuditPayloadInput = {
	purpose: SupportModeRouteAuditPurpose;
	actionId: string;
	eventType?: string | null;
	result?: "success" | "blocked" | null;
	blockReason?: string | null;
	changedRecordIds?: string[] | null;
	issuedAt: number;
	nonce: string;
};

type RouteAuditJsonValue =
	| string
	| number
	| boolean
	| null
	| RouteAuditJsonValue[]
	| { [key: string]: RouteAuditJsonValue };

type RouteAuditJsonObject = { [key: string]: RouteAuditJsonValue };

export type SupportModeRouteAuditPayload = {
	version: typeof SUPPORT_MODE_ROUTE_AUDIT_ASSERTION_VERSION;
	purpose: SupportModeRouteAuditPurpose;
	actionId: string;
	eventType: string | null;
	result: "success" | "blocked" | null;
	blockReason: string | null;
	changedRecordIds: string[] | null;
	issuedAt: number;
	nonce: string;
};

function normalizeChangedRecordIds(value: string[] | null | undefined) {
	if (!value || value.length === 0) {
		return null;
	}

	return value;
}

export function createSupportModeRouteAuditPayload(
	input: SupportModeRouteAuditPayloadInput,
) {
	return JSON.stringify({
		version: SUPPORT_MODE_ROUTE_AUDIT_ASSERTION_VERSION,
		purpose: input.purpose,
		actionId: input.actionId,
		eventType: input.eventType ?? null,
		result: input.result ?? null,
		blockReason: input.blockReason ?? null,
		changedRecordIds: normalizeChangedRecordIds(input.changedRecordIds),
		issuedAt: input.issuedAt,
		nonce: input.nonce,
	} satisfies SupportModeRouteAuditPayload);
}

export function parseSupportModeRouteAuditPayload(
	value: string,
): SupportModeRouteAuditPayload | null {
	try {
		const parsed = JSON.parse(value) as RouteAuditJsonValue;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return null;
		}
		const payload = parsed as RouteAuditJsonObject;
		const changedRecordIds = payload.changedRecordIds;
		if (
			payload.version !== SUPPORT_MODE_ROUTE_AUDIT_ASSERTION_VERSION ||
			(payload.purpose !== "blocked_action" &&
				payload.purpose !== "download_attempt") ||
			typeof payload.actionId !== "string" ||
			(payload.eventType !== null && typeof payload.eventType !== "string") ||
			(payload.result !== null &&
				payload.result !== "success" &&
				payload.result !== "blocked") ||
			(payload.blockReason !== null &&
				typeof payload.blockReason !== "string") ||
			(changedRecordIds !== null &&
				(!Array.isArray(changedRecordIds) ||
					changedRecordIds.some((item) => typeof item !== "string"))) ||
			typeof payload.issuedAt !== "number" ||
			typeof payload.nonce !== "string"
		) {
			return null;
		}

		return payload as SupportModeRouteAuditPayload;
	} catch {
		return null;
	}
}

export function supportModeRouteAuditPayloadMatches(
	payload: SupportModeRouteAuditPayload,
	expected: Omit<SupportModeRouteAuditPayloadInput, "issuedAt" | "nonce">,
) {
	if (
		payload.purpose !== expected.purpose ||
		payload.actionId !== expected.actionId ||
		payload.eventType !== (expected.eventType ?? null) ||
		payload.result !== (expected.result ?? null) ||
		payload.blockReason !== (expected.blockReason ?? null)
	) {
		return false;
	}

	const expectedRecordIds = normalizeChangedRecordIds(
		expected.changedRecordIds,
	);
	if (payload.changedRecordIds?.length !== expectedRecordIds?.length) {
		return false;
	}
	if (!payload.changedRecordIds || !expectedRecordIds) {
		return payload.changedRecordIds === expectedRecordIds;
	}

	return payload.changedRecordIds.every(
		(recordId, index) => recordId === expectedRecordIds[index],
	);
}
