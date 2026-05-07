import type { GenericId } from "convex/values";
import { ConvexError } from "convex/values";

import {
	classifyAdminImpersonationAuthority,
	createSupportModeStatus,
	readAdminImpersonationConfig,
	type SupportModeStatus,
} from "../../platform/admin-impersonation";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type {
	ImpersonationAuditEventType,
	ImpersonationAuditResult,
	ImpersonationBlockReason,
	ImpersonationFailureReason,
	ImpersonationSessionInvalidationReason,
	ImpersonationSetupIntegrityIssue,
} from "./types";

const IMPERSONATION_SESSION_DURATION_MS = 2 * 60 * 60 * 1_000;
const IMPERSONATION_REASON_MIN_LENGTH = 10;
const IMPERSONATION_REASON_MAX_LENGTH = 500;

type ImpersonationSessionId = GenericId<"impersonationSessions">;
type ImpersonationSession = Doc<"impersonationSessions">;
type ImpersonationAuditEvent = Doc<"impersonationAuditEvents">;
type IdentityWithActorClaim = {
	subject: string;
	email?: string;
	emailVerified?: boolean;
	act?: unknown;
	[key: string]: unknown;
};

export type ParsedClerkActorClaim =
	| {
			kind: "none";
			subjectClerkUserId: string;
			subjectEmail: string | null;
	  }
	| {
			kind: "valid";
			subjectClerkUserId: string;
			subjectEmail: string | null;
			actorClerkUserId: string;
			clerkActorSessionId: string | null;
			clerkActorIssuer: string | null;
			impersonationSessionId: ImpersonationSessionId | null;
	  }
	| {
			kind: "malformed";
			subjectClerkUserId: string;
			subjectEmail: string | null;
	  };

export type CreateImpersonationSessionResult = {
	sessionId: ImpersonationSessionId;
	expiresAt: number;
	status: "starting";
};

export type StartImpersonationSessionInput = {
	actorClerkUserId: string;
	actorEmail: string;
	subjectClerkUserId: string;
	subjectEmail?: string | null;
	reason: string;
	requestId?: string | null;
	userAgent?: string | null;
	ipHash?: string | null;
	setupIntegrityIssues?: ImpersonationSetupIntegrityIssue[];
};

export type AppendImpersonationAuditEventInput = {
	sessionId: ImpersonationSessionId;
	eventType: ImpersonationAuditEventType;
	actionId: string;
	result: ImpersonationAuditResult;
	actorClerkUserId: string;
	actorEmail: string;
	subjectClerkUserId: string;
	subjectEmail?: string | null;
	changedRecordIds?: string[] | null;
	blockReason?: ImpersonationBlockReason | null;
	failureReason?: ImpersonationFailureReason | null;
	requestId?: string | null;
	userAgent?: string | null;
	ipHash?: string | null;
	setupIntegrityIssues?: ImpersonationSetupIntegrityIssue[];
	createdAt?: number;
};

export type SupportModeWritePolicy =
	| {
			kind: "allowed";
			sessionId: ImpersonationSessionId;
			actorClerkUserId: string;
			subjectClerkUserId: string;
	  }
	| {
			kind: "blocked";
			blockReason: ImpersonationBlockReason;
	  }
	| {
			kind: "not_impersonating";
	  };

export type ImpersonationSessionHistoryItem = {
	sessionId: ImpersonationSessionId;
	customerEmail: string | null;
	reason: string;
	status: ImpersonationSession["status"];
	startedAt: number;
	updatedAt: number;
	stoppedAt: number | null;
	failedAt: number | null;
	invalidatedAt: number | null;
	expiresAt: number;
	blockedEventCount: number;
	eventCount: number;
	integrityWarnings: ImpersonationSetupIntegrityIssue[];
};

export type RecordSupportModeAuditResult =
	| { kind: "recorded"; sessionId: ImpersonationSessionId }
	| { kind: "not_impersonating" }
	| { kind: "not_recorded"; reason: ImpersonationBlockReason };

function normalizeOptionalString(value: string | null | undefined) {
	const normalized = value?.trim();
	return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getActorClaim(identity: IdentityWithActorClaim): unknown {
	const claims = identity as unknown as Record<string, unknown>;
	return claims.act;
}

function getActorImpersonationSessionId(actorClaim: Record<string, unknown>) {
	if (typeof actorClaim.impersonationSessionId === "string") {
		return actorClaim.impersonationSessionId as ImpersonationSessionId;
	}

	const additionalProperties =
		actorClaim.additionalProperties ?? actorClaim.additional_properties;
	if (!isRecord(additionalProperties)) {
		return null;
	}

	const nestedSessionId =
		additionalProperties.impersonationSessionId ??
		additionalProperties.impersonation_session_id;
	return typeof nestedSessionId === "string"
		? (nestedSessionId as ImpersonationSessionId)
		: null;
}

function isUsableSessionStatus(session: ImpersonationSession) {
	return session.status === "starting" || session.status === "active";
}

function isAdminEmail(configAdminEmails: string[], email: string) {
	return configAdminEmails.includes(normalizeEmail(email));
}

function isSessionExpired(session: ImpersonationSession, now: number) {
	return isUsableSessionStatus(session) && session.expiresAt <= now;
}

function redactStatusForSession(
	state: SupportModeStatus["state"],
	session: ImpersonationSession,
	now: number,
): SupportModeStatus {
	const timeRemainingMs =
		state === "active" ? Math.max(0, session.expiresAt - now) : null;

	return createSupportModeStatus({
		state,
		startEligible: false,
		stopEligible: state !== "stopped",
		customerEmail: session.subjectEmail ?? null,
		reason: session.reason,
		timeRemainingMs,
		integrityWarnings: session.setupIntegrityIssues,
	});
}

function createBlockedStatus(
	state: SupportModeStatus["state"],
): SupportModeStatus {
	return createSupportModeStatus({
		state,
		startEligible: false,
		stopEligible: false,
		customerEmail: null,
		reason: null,
		timeRemainingMs: null,
		integrityWarnings: [],
	});
}

export function normalizeImpersonationReason(reason: string) {
	const normalized = reason.trim().replace(/\s+/g, " ");
	if (normalized.length < IMPERSONATION_REASON_MIN_LENGTH) {
		throw new Error(
			`Impersonation reason must be at least ${IMPERSONATION_REASON_MIN_LENGTH} characters.`,
		);
	}
	if (normalized.length > IMPERSONATION_REASON_MAX_LENGTH) {
		throw new Error(
			`Impersonation reason must be ${IMPERSONATION_REASON_MAX_LENGTH} characters or fewer.`,
		);
	}

	return normalized;
}

export function parseClerkActorClaim(
	identity: IdentityWithActorClaim,
): ParsedClerkActorClaim {
	const subjectEmail = identity.email ? normalizeEmail(identity.email) : null;
	const actorClaim = getActorClaim(identity);
	if (actorClaim === undefined || actorClaim === null) {
		return {
			kind: "none",
			subjectClerkUserId: identity.subject,
			subjectEmail,
		};
	}

	if (!isRecord(actorClaim) || typeof actorClaim.sub !== "string") {
		return {
			kind: "malformed",
			subjectClerkUserId: identity.subject,
			subjectEmail,
		};
	}

	return {
		kind: "valid",
		subjectClerkUserId: identity.subject,
		subjectEmail,
		actorClerkUserId: actorClaim.sub,
		clerkActorSessionId:
			typeof actorClaim.sid === "string" ? actorClaim.sid : null,
		clerkActorIssuer:
			typeof actorClaim.iss === "string" ? actorClaim.iss : null,
		impersonationSessionId: getActorImpersonationSessionId(actorClaim),
	};
}

async function requireCurrentImpersonationAdmin(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	const config = readAdminImpersonationConfig();
	const authority = classifyAdminImpersonationAuthority({
		config,
		identity,
	});

	if (authority.state === "admin") {
		return authority;
	}

	if (identity) {
		const actorClaim = parseClerkActorClaim(identity);
		if (actorClaim.kind === "valid" && actorClaim.impersonationSessionId) {
			const session = await ctx.db.get(actorClaim.impersonationSessionId);
			if (
				session &&
				session.actorClerkUserId === actorClaim.actorClerkUserId &&
				config.state === "enabled" &&
				isAdminEmail(config.adminEmails, session.actorEmail)
			) {
				return {
					state: "admin" as const,
					canStartImpersonation: true as const,
					issue: null,
					clerkUserId: session.actorClerkUserId,
					email: session.actorEmail,
				};
			}
		}
	}

	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	throw new ConvexError("Admin impersonation access denied");
}

async function getSetupIntegrityIssuesForSubject(
	ctx: QueryCtx | MutationCtx,
	subjectClerkUserId: string,
): Promise<ImpersonationSetupIntegrityIssue[]> {
	const issues = new Set<ImpersonationSetupIntegrityIssue>();
	const accessGrant = await ctx.db
		.query("productAccessGrants")
		.withIndex("by_clerk_user_id", (query) =>
			query.eq("clerkUserId", subjectClerkUserId),
		)
		.unique();
	if (!accessGrant || accessGrant.status !== "granted") {
		issues.add("missing_product_access_grant");
	}

	const workspaceProjects = await ctx.db
		.query("workspaceProjects")
		.withIndex("by_clerk_user_id_and_updated_at", (query) =>
			query.eq("clerkUserId", subjectClerkUserId),
		)
		.take(1);
	if (workspaceProjects.length === 0) {
		issues.add("missing_workspace_project");
	}

	return Array.from(issues);
}

export async function appendImpersonationAuditEventHandler(
	ctx: MutationCtx,
	input: AppendImpersonationAuditEventInput,
) {
	const createdAt = input.createdAt ?? Date.now();
	return await ctx.db.insert("impersonationAuditEvents", {
		sessionId: input.sessionId,
		eventType: input.eventType,
		actionId: input.actionId,
		result: input.result,
		actorClerkUserId: input.actorClerkUserId,
		actorEmail: normalizeEmail(input.actorEmail),
		subjectClerkUserId: input.subjectClerkUserId,
		subjectEmail: input.subjectEmail
			? normalizeEmail(input.subjectEmail)
			: undefined,
		changedRecordIds: input.changedRecordIds ?? undefined,
		blockReason: input.blockReason ?? undefined,
		failureReason: input.failureReason ?? undefined,
		requestId: normalizeOptionalString(input.requestId),
		userAgent: normalizeOptionalString(input.userAgent),
		ipHash: normalizeOptionalString(input.ipHash),
		setupIntegrityIssues: input.setupIntegrityIssues ?? [],
		createdAt,
	});
}

export async function createImpersonationSessionHandler(
	ctx: MutationCtx,
	input: StartImpersonationSessionInput,
): Promise<CreateImpersonationSessionResult> {
	const now = Date.now();
	const reason = normalizeImpersonationReason(input.reason);
	const setupIntegrityIssues = input.setupIntegrityIssues ?? [];
	const sessionId = await ctx.db.insert("impersonationSessions", {
		actorClerkUserId: input.actorClerkUserId,
		actorEmail: normalizeEmail(input.actorEmail),
		subjectClerkUserId: input.subjectClerkUserId,
		subjectEmail: input.subjectEmail
			? normalizeEmail(input.subjectEmail)
			: undefined,
		reason,
		status: "starting",
		setupIntegrityIssues,
		startedAt: now,
		updatedAt: now,
		expiresAt: now + IMPERSONATION_SESSION_DURATION_MS,
		requestId: normalizeOptionalString(input.requestId),
		userAgent: normalizeOptionalString(input.userAgent),
		ipHash: normalizeOptionalString(input.ipHash),
	});

	await appendImpersonationAuditEventHandler(ctx, {
		sessionId,
		eventType: "session_started",
		actionId: "impersonation.session.starting",
		result: "success",
		actorClerkUserId: input.actorClerkUserId,
		actorEmail: input.actorEmail,
		subjectClerkUserId: input.subjectClerkUserId,
		subjectEmail: input.subjectEmail,
		requestId: input.requestId,
		userAgent: input.userAgent,
		ipHash: input.ipHash,
		setupIntegrityIssues,
		createdAt: now,
	});

	return {
		sessionId,
		expiresAt: now + IMPERSONATION_SESSION_DURATION_MS,
		status: "starting",
	};
}

export async function beginAdminImpersonationSessionHandler(
	ctx: MutationCtx,
	args: {
		subjectClerkUserId: string;
		subjectEmail?: string | null;
		reason: string;
		requestId?: string | null;
		userAgent?: string | null;
		ipHash?: string | null;
	},
): Promise<CreateImpersonationSessionResult> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}
	const currentActorClaim = parseClerkActorClaim(identity);
	if (currentActorClaim.kind === "valid") {
		throw new ConvexError("Stop the current impersonation session first.");
	}

	const admin = await requireCurrentImpersonationAdmin(ctx);
	const config = readAdminImpersonationConfig();
	if (config.state !== "enabled") {
		throw new ConvexError("Admin impersonation is not enabled.");
	}

	if (args.subjectClerkUserId === admin.clerkUserId) {
		throw new ConvexError("Admins cannot impersonate themselves.");
	}

	if (
		args.subjectEmail &&
		isAdminEmail(config.adminEmails, args.subjectEmail)
	) {
		throw new ConvexError("Configured admins cannot be impersonated.");
	}

	const setupIntegrityIssues = await getSetupIntegrityIssuesForSubject(
		ctx,
		args.subjectClerkUserId,
	);

	return await createImpersonationSessionHandler(ctx, {
		actorClerkUserId: admin.clerkUserId,
		actorEmail: admin.email,
		subjectClerkUserId: args.subjectClerkUserId,
		subjectEmail: args.subjectEmail,
		reason: args.reason,
		requestId: args.requestId,
		userAgent: args.userAgent,
		ipHash: args.ipHash,
		setupIntegrityIssues,
	});
}

export async function markCurrentImpersonationSessionActiveHandler(
	ctx: MutationCtx,
) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	const actorClaim = parseClerkActorClaim(identity);
	if (actorClaim.kind !== "valid" || !actorClaim.impersonationSessionId) {
		throw new ConvexError("Support mode session not found.");
	}

	const session = await ctx.db.get(actorClaim.impersonationSessionId);
	if (!session) {
		throw new ConvexError("Support mode session not found.");
	}

	if (
		session.actorClerkUserId !== actorClaim.actorClerkUserId ||
		session.subjectClerkUserId !== identity.subject
	) {
		throw new ConvexError("Support mode session mismatch.");
	}

	if (session.status !== "starting" && session.status !== "active") {
		throw new ConvexError("Support mode session is no longer active.");
	}

	return await markImpersonationSessionActiveHandler(ctx, {
		sessionId: session._id,
	});
}

export async function markImpersonationSessionActiveHandler(
	ctx: MutationCtx,
	args: { sessionId: ImpersonationSessionId },
) {
	const now = Date.now();
	await ctx.db.patch(args.sessionId, {
		status: "active",
		updatedAt: now,
	});
	return await ctx.db.get(args.sessionId);
}

export async function markImpersonationSessionStoppedHandler(
	ctx: MutationCtx,
	args: { sessionId: ImpersonationSessionId },
) {
	const now = Date.now();
	const session = await ctx.db.get(args.sessionId);
	if (!session) {
		throw new Error("Impersonation session not found.");
	}

	await ctx.db.patch(args.sessionId, {
		status: "stopped",
		updatedAt: now,
		stoppedAt: now,
	});
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: args.sessionId,
		eventType: "session_stopped",
		actionId: "impersonation.session.stop",
		result: "success",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		setupIntegrityIssues: session.setupIntegrityIssues,
		createdAt: now,
	});

	return await ctx.db.get(args.sessionId);
}

export async function stopCurrentImpersonationSessionHandler(ctx: MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	const actorClaim = parseClerkActorClaim(identity);
	if (actorClaim.kind !== "valid" || !actorClaim.impersonationSessionId) {
		throw new ConvexError("Support mode session not found.");
	}

	const session = await ctx.db.get(actorClaim.impersonationSessionId);
	if (!session) {
		throw new ConvexError("Support mode session not found.");
	}

	if (
		session.actorClerkUserId !== actorClaim.actorClerkUserId ||
		session.subjectClerkUserId !== identity.subject
	) {
		await invalidateSession(ctx, session, "session_mismatch", Date.now());
		throw new ConvexError("Support mode session mismatch.");
	}

	if (session.status === "stopped") {
		return session;
	}

	return await markImpersonationSessionStoppedHandler(ctx, {
		sessionId: session._id,
	});
}

export async function markImpersonationSessionStartFailedHandler(
	ctx: MutationCtx,
	args: {
		sessionId: ImpersonationSessionId;
		failureReason: ImpersonationFailureReason;
	},
) {
	const now = Date.now();
	const session = await ctx.db.get(args.sessionId);
	if (!session) {
		throw new Error("Impersonation session not found.");
	}

	await ctx.db.patch(args.sessionId, {
		status: "start_failed",
		updatedAt: now,
		failedAt: now,
		failureReason: args.failureReason,
	});
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: args.sessionId,
		eventType: "start_failed",
		actionId: "impersonation.session.start_failed",
		result: "failed",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		failureReason: args.failureReason,
		setupIntegrityIssues: session.setupIntegrityIssues,
		createdAt: now,
	});

	return await ctx.db.get(args.sessionId);
}

export async function markAdminImpersonationSessionStartFailedHandler(
	ctx: MutationCtx,
	args: {
		sessionId: ImpersonationSessionId;
		failureReason: ImpersonationFailureReason;
	},
) {
	const admin = await requireCurrentImpersonationAdmin(ctx);
	const session = await ctx.db.get(args.sessionId);
	if (!session) {
		throw new ConvexError("Impersonation session not found.");
	}
	if (session.actorClerkUserId !== admin.clerkUserId) {
		throw new ConvexError("Admin impersonation access denied");
	}

	return await markImpersonationSessionStartFailedHandler(ctx, args);
}

async function expireSessionIfNeeded(
	ctx: MutationCtx,
	session: ImpersonationSession,
	now: number,
) {
	if (!isSessionExpired(session, now)) {
		return session;
	}

	await ctx.db.patch(session._id, {
		status: "expired",
		updatedAt: now,
	});
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: "session_expired",
		actionId: "impersonation.session.expired",
		result: "success",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		setupIntegrityIssues: session.setupIntegrityIssues,
		createdAt: now,
	});

	return {
		...session,
		status: "expired" as const,
		updatedAt: now,
	};
}

async function invalidateSession(
	ctx: MutationCtx,
	session: ImpersonationSession,
	reason: ImpersonationSessionInvalidationReason,
	now: number,
) {
	if (!isUsableSessionStatus(session)) {
		return session;
	}

	await ctx.db.patch(session._id, {
		status: "invalidated",
		updatedAt: now,
		invalidatedAt: now,
		invalidationReason: reason,
	});
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: "session_invalidated",
		actionId: `impersonation.session.${reason}`,
		result: "blocked",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		blockReason:
			reason === "session_mismatch"
				? "support_session_mismatch"
				: reason === "unsupported_clerk_dashboard_impersonation"
					? "unsupported_clerk_dashboard_impersonation"
					: null,
		setupIntegrityIssues: session.setupIntegrityIssues,
		createdAt: now,
	});

	return {
		...session,
		status: "invalidated" as const,
		updatedAt: now,
		invalidatedAt: now,
		invalidationReason: reason,
	};
}

function statusForTerminalSession(
	session: ImpersonationSession,
	now: number,
): SupportModeStatus {
	if (session.status === "expired") {
		return redactStatusForSession("expired", session, now);
	}
	if (session.status === "stopped") {
		return redactStatusForSession("stopped", session, now);
	}
	if (
		session.status === "invalidated" &&
		session.invalidationReason === "feature_disabled"
	) {
		return redactStatusForSession("kill_switch_disabled", session, now);
	}
	if (session.status === "invalidated") {
		return redactStatusForSession("invalid_mismatch", session, now);
	}
	if (session.status === "start_failed") {
		return redactStatusForSession(
			"unsupported_clerk_dashboard_impersonation",
			session,
			now,
		);
	}

	return redactStatusForSession("active", session, now);
}

async function getStatusForActorSession({
	ctx,
	identity,
	actorClaim,
	now,
	allowSessionMutation,
}: {
	ctx: QueryCtx | MutationCtx;
	identity: IdentityWithActorClaim;
	actorClaim: Extract<ParsedClerkActorClaim, { kind: "valid" }>;
	now: number;
	allowSessionMutation: boolean;
}): Promise<SupportModeStatus> {
	if (!actorClaim.impersonationSessionId) {
		return createBlockedStatus("unsupported_clerk_dashboard_impersonation");
	}

	const session = await ctx.db.get(actorClaim.impersonationSessionId);
	if (!session) {
		return createBlockedStatus("unsupported_clerk_dashboard_impersonation");
	}

	if (
		session.actorClerkUserId !== actorClaim.actorClerkUserId ||
		session.subjectClerkUserId !== identity.subject
	) {
		if (allowSessionMutation) {
			const invalidatedSession = await invalidateSession(
				ctx as MutationCtx,
				session,
				"session_mismatch",
				now,
			);
			return statusForTerminalSession(invalidatedSession, now);
		}

		return redactStatusForSession("invalid_mismatch", session, now);
	}

	const config = readAdminImpersonationConfig();
	if (config.state === "disabled") {
		if (allowSessionMutation) {
			const invalidatedSession = await invalidateSession(
				ctx as MutationCtx,
				session,
				"feature_disabled",
				now,
			);
			return statusForTerminalSession(invalidatedSession, now);
		}

		return redactStatusForSession("kill_switch_disabled", session, now);
	}

	if (config.state === "misconfigured") {
		return redactStatusForSession("misconfigured", session, now);
	}

	if (isSessionExpired(session, now)) {
		if (allowSessionMutation) {
			const expiredSession = await expireSessionIfNeeded(
				ctx as MutationCtx,
				session,
				now,
			);
			return statusForTerminalSession(expiredSession, now);
		}

		return redactStatusForSession("expired", session, now);
	}

	return statusForTerminalSession(session, now);
}

async function buildSupportModeStatus({
	ctx,
	identity,
	now,
	allowSessionMutation,
}: {
	ctx: QueryCtx | MutationCtx;
	identity: IdentityWithActorClaim | null;
	now: number;
	allowSessionMutation: boolean;
}): Promise<SupportModeStatus> {
	const config = readAdminImpersonationConfig();
	if (!identity) {
		if (config.state === "disabled") {
			return createBlockedStatus("disabled");
		}
		if (config.state === "misconfigured") {
			return createBlockedStatus("misconfigured");
		}
		return createBlockedStatus("not_admin");
	}

	const actorClaim = parseClerkActorClaim(identity);
	if (actorClaim.kind === "malformed") {
		return createBlockedStatus("unsupported_clerk_dashboard_impersonation");
	}
	if (actorClaim.kind === "valid") {
		return await getStatusForActorSession({
			ctx,
			identity,
			actorClaim,
			now,
			allowSessionMutation,
		});
	}

	const authority = classifyAdminImpersonationAuthority({
		config,
		identity,
	});
	if (authority.state === "disabled") {
		return createBlockedStatus("disabled");
	}
	if (authority.state === "misconfigured") {
		return createBlockedStatus("misconfigured");
	}
	if (authority.state === "not_admin") {
		return createBlockedStatus("not_admin");
	}

	return createSupportModeStatus({
		state: "normal",
		startEligible: true,
		stopEligible: false,
		customerEmail: null,
		reason: null,
		timeRemainingMs: null,
		integrityWarnings: [],
	});
}

export async function getSupportModeStatusHandler(
	ctx: QueryCtx,
): Promise<SupportModeStatus> {
	const identity = await ctx.auth.getUserIdentity();
	return await buildSupportModeStatus({
		ctx,
		identity,
		now: Date.now(),
		allowSessionMutation: false,
	});
}

export async function observeSupportModeStatusHandler(
	ctx: MutationCtx,
): Promise<SupportModeStatus> {
	const identity = await ctx.auth.getUserIdentity();
	return await buildSupportModeStatus({
		ctx,
		identity,
		now: Date.now(),
		allowSessionMutation: true,
	});
}

function getSupportModeBlockReasonForStatus(
	status: SupportModeStatus,
): ImpersonationBlockReason {
	if (status.state === "active") {
		return "unclassified_write";
	}
	if (status.state === "expired") {
		return "support_session_expired";
	}
	if (status.state === "invalid_mismatch") {
		return "support_session_mismatch";
	}
	if (status.state === "kill_switch_disabled") {
		return "external_side_effect_blocked";
	}
	return "unsupported_clerk_dashboard_impersonation";
}

async function getCurrentActorSessionForAudit(ctx: MutationCtx): Promise<
	| {
			kind: "active";
			session: ImpersonationSession;
	  }
	| {
			kind: "not_impersonating";
	  }
	| {
			kind: "blocked";
			session: ImpersonationSession | null;
			blockReason: ImpersonationBlockReason;
	  }
> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return { kind: "not_impersonating" };
	}

	const actorClaim = parseClerkActorClaim(identity);
	if (actorClaim.kind === "none") {
		return { kind: "not_impersonating" };
	}
	if (actorClaim.kind === "malformed" || !actorClaim.impersonationSessionId) {
		return {
			kind: "blocked",
			session: null,
			blockReason: "unsupported_clerk_dashboard_impersonation",
		};
	}

	const session = await ctx.db.get(actorClaim.impersonationSessionId);
	if (!session) {
		return {
			kind: "blocked",
			session: null,
			blockReason: "unsupported_clerk_dashboard_impersonation",
		};
	}

	const status = await observeSupportModeStatusHandler(ctx);
	if (status.state !== "active") {
		return {
			kind: "blocked",
			session,
			blockReason: getSupportModeBlockReasonForStatus(status),
		};
	}

	return { kind: "active", session };
}

export async function appendSupportModeWriteSuccessAuditHandler(
	ctx: MutationCtx,
	args: { actionId: string; changedRecordIds?: string[] | null },
): Promise<RecordSupportModeAuditResult> {
	const auditContext = await getCurrentActorSessionForAudit(ctx);
	if (auditContext.kind === "not_impersonating") {
		return { kind: "not_impersonating" };
	}
	if (auditContext.kind === "blocked") {
		return {
			kind: "not_recorded",
			reason: auditContext.blockReason,
		};
	}

	const session = auditContext.session;
	if (!session) {
		return {
			kind: "not_recorded",
			reason: "unsupported_clerk_dashboard_impersonation",
		};
	}
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: "write_attempted",
		actionId: args.actionId,
		result: "success",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		changedRecordIds: args.changedRecordIds,
		setupIntegrityIssues: session.setupIntegrityIssues,
	});

	return { kind: "recorded", sessionId: session._id };
}

export async function assertSupportModeWriteAllowedHandler(
	ctx: MutationCtx,
	args: { actionId: string },
): Promise<SupportModeWritePolicy> {
	const auditContext = await getCurrentActorSessionForAudit(ctx);
	if (auditContext.kind === "not_impersonating") {
		return { kind: "not_impersonating" };
	}
	if (auditContext.kind === "active") {
		return {
			kind: "allowed",
			sessionId: auditContext.session._id,
			actorClerkUserId: auditContext.session.actorClerkUserId,
			subjectClerkUserId: auditContext.session.subjectClerkUserId,
		};
	}

	const session = auditContext.session;
	if (session) {
		await appendImpersonationAuditEventHandler(ctx, {
			sessionId: session._id,
			eventType: "write_attempted",
			actionId: args.actionId,
			result: "blocked",
			actorClerkUserId: session.actorClerkUserId,
			actorEmail: session.actorEmail,
			subjectClerkUserId: session.subjectClerkUserId,
			subjectEmail: session.subjectEmail,
			blockReason: auditContext.blockReason,
			setupIntegrityIssues: session.setupIntegrityIssues,
		});
	}

	return {
		kind: "blocked",
		blockReason: auditContext.blockReason,
	};
}

export async function recordBlockedSupportModeActionHandler(
	ctx: MutationCtx,
	args: {
		actionId: string;
		blockReason: ImpersonationBlockReason;
		eventType: ImpersonationAuditEventType;
		requestId?: string | null;
		userAgent?: string | null;
		ipHash?: string | null;
	},
): Promise<RecordSupportModeAuditResult> {
	const auditContext = await getCurrentActorSessionForAudit(ctx);
	if (auditContext.kind === "not_impersonating") {
		return { kind: "not_impersonating" };
	}
	if (auditContext.kind === "blocked" && !auditContext.session) {
		return {
			kind: "not_recorded",
			reason: auditContext.blockReason,
		};
	}

	const session = auditContext.session;
	if (!session) {
		return {
			kind: "not_recorded",
			reason:
				auditContext.kind === "blocked"
					? auditContext.blockReason
					: "unsupported_clerk_dashboard_impersonation",
		};
	}
	const blockReason =
		auditContext.kind === "blocked"
			? auditContext.blockReason
			: args.blockReason;
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: args.eventType,
		actionId: args.actionId,
		result: "blocked",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		blockReason,
		requestId: args.requestId,
		userAgent: args.userAgent,
		ipHash: args.ipHash,
		setupIntegrityIssues: session.setupIntegrityIssues,
	});

	return { kind: "recorded", sessionId: session._id };
}

export async function recordSupportModeDownloadAttemptHandler(
	ctx: MutationCtx,
	args: {
		actionId: string;
		result: "success" | "blocked";
		blockReason?: ImpersonationBlockReason | null;
		changedRecordIds?: string[] | null;
		requestId?: string | null;
		userAgent?: string | null;
		ipHash?: string | null;
	},
): Promise<RecordSupportModeAuditResult> {
	const auditContext = await getCurrentActorSessionForAudit(ctx);
	if (auditContext.kind === "not_impersonating") {
		return { kind: "not_impersonating" };
	}
	if (auditContext.kind === "blocked" && !auditContext.session) {
		return {
			kind: "not_recorded",
			reason: auditContext.blockReason,
		};
	}

	const session = auditContext.session;
	if (!session) {
		return {
			kind: "not_recorded",
			reason:
				auditContext.kind === "blocked"
					? auditContext.blockReason
					: "unsupported_clerk_dashboard_impersonation",
		};
	}
	if (auditContext.kind === "blocked" && args.result === "success") {
		await appendImpersonationAuditEventHandler(ctx, {
			sessionId: session._id,
			eventType: "download_attempted",
			actionId: args.actionId,
			result: "blocked",
			actorClerkUserId: session.actorClerkUserId,
			actorEmail: session.actorEmail,
			subjectClerkUserId: session.subjectClerkUserId,
			subjectEmail: session.subjectEmail,
			changedRecordIds: args.changedRecordIds,
			blockReason: auditContext.blockReason,
			requestId: args.requestId,
			userAgent: args.userAgent,
			ipHash: args.ipHash,
			setupIntegrityIssues: session.setupIntegrityIssues,
		});
		return {
			kind: "not_recorded",
			reason: auditContext.blockReason,
		};
	}
	const blockReason =
		args.result === "blocked"
			? (args.blockReason ??
				(auditContext.kind === "blocked"
					? auditContext.blockReason
					: "unclassified_write"))
			: undefined;
	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: "download_attempted",
		actionId: args.actionId,
		result: args.result,
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		changedRecordIds: args.changedRecordIds,
		blockReason,
		requestId: args.requestId,
		userAgent: args.userAgent,
		ipHash: args.ipHash,
		setupIntegrityIssues: session.setupIntegrityIssues,
	});

	return { kind: "recorded", sessionId: session._id };
}

function toHistoryItem({
	session,
	events,
}: {
	session: ImpersonationSession;
	events: ImpersonationAuditEvent[];
}): ImpersonationSessionHistoryItem {
	return {
		sessionId: session._id,
		customerEmail: session.subjectEmail ?? null,
		reason: session.reason,
		status: session.status,
		startedAt: session.startedAt,
		updatedAt: session.updatedAt,
		stoppedAt: session.stoppedAt ?? null,
		failedAt: session.failedAt ?? null,
		invalidatedAt: session.invalidatedAt ?? null,
		expiresAt: session.expiresAt,
		blockedEventCount: events.filter((event) => event.result === "blocked")
			.length,
		eventCount: events.length,
		integrityWarnings: session.setupIntegrityIssues,
	};
}

export async function listAdminImpersonationSessionHistoryHandler(
	ctx: QueryCtx,
): Promise<ImpersonationSessionHistoryItem[]> {
	const admin = await requireCurrentImpersonationAdmin(ctx);
	const sessions = await ctx.db
		.query("impersonationSessions")
		.withIndex("by_actor_clerk_user_id_and_updated_at", (query) =>
			query.eq("actorClerkUserId", admin.clerkUserId),
		)
		.order("desc")
		.take(12);

	return await Promise.all(
		sessions.map(async (session) => {
			const events = await ctx.db
				.query("impersonationAuditEvents")
				.withIndex("by_session_id_and_created_at", (query) =>
					query.eq("sessionId", session._id),
				)
				.collect();
			return toHistoryItem({ session, events });
		}),
	);
}

export async function evaluateSupportModeWritePolicyHandler(
	ctx: MutationCtx,
	args: { actionId: string },
): Promise<SupportModeWritePolicy> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return { kind: "not_impersonating" };
	}

	const actorClaim = parseClerkActorClaim(identity);
	if (actorClaim.kind === "none") {
		return { kind: "not_impersonating" };
	}
	if (actorClaim.kind === "malformed" || !actorClaim.impersonationSessionId) {
		return {
			kind: "blocked",
			blockReason: "unsupported_clerk_dashboard_impersonation",
		};
	}

	const session = await ctx.db.get(actorClaim.impersonationSessionId);
	if (!session) {
		return {
			kind: "blocked",
			blockReason: "unsupported_clerk_dashboard_impersonation",
		};
	}

	const status = await observeSupportModeStatusHandler(ctx);
	const blockReason = getSupportModeBlockReasonForStatus(status);

	await appendImpersonationAuditEventHandler(ctx, {
		sessionId: session._id,
		eventType: "write_attempted",
		actionId: args.actionId,
		result: "blocked",
		actorClerkUserId: session.actorClerkUserId,
		actorEmail: session.actorEmail,
		subjectClerkUserId: session.subjectClerkUserId,
		subjectEmail: session.subjectEmail,
		blockReason,
		setupIntegrityIssues: session.setupIntegrityIssues,
	});

	return { kind: "blocked", blockReason };
}
