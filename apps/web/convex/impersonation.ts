import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import {
	appendSupportModeWriteSuccessAuditHandler,
	appendImpersonationAuditEventHandler,
	beginAdminImpersonationSessionHandler,
	createImpersonationSessionHandler,
	evaluateSupportModeWritePolicyHandler,
	getSupportModeStatusHandler,
	listAdminImpersonationSessionHistoryHandler,
	markAdminImpersonationSessionStartFailedHandler,
	markCurrentImpersonationSessionActiveHandler,
	markImpersonationSessionActiveHandler,
	markImpersonationSessionStartFailedHandler,
	markImpersonationSessionStoppedHandler,
	observeSupportModeStatusHandler,
	recordBlockedSupportModeActionHandler,
	recordSupportModeDownloadAttemptHandler,
	stopCurrentImpersonationSessionHandler,
} from "./impersonation/model";
import {
	impersonationAuditEventTypeValidator,
	impersonationAuditResultValidator,
	impersonationBlockReasonValidator,
	impersonationFailureReasonValidator,
	impersonationSessionHistoryItemValidator,
	impersonationSetupIntegrityIssueValidator,
	supportModeStatusValidator,
} from "./impersonation/validators";

const createImpersonationSessionResultValidator = v.object({
	sessionId: v.id("impersonationSessions"),
	expiresAt: v.number(),
	status: v.literal("starting"),
});

const nullableStringArg = v.optional(v.union(v.string(), v.null()));

const requestMetadataArgs = {
	requestId: nullableStringArg,
	userAgent: nullableStringArg,
	ipHash: nullableStringArg,
};

export const getSupportModeStatus = query({
	args: {},
	returns: supportModeStatusValidator,
	handler: getSupportModeStatusHandler,
});

export const observeSupportModeStatus = mutation({
	args: {},
	returns: supportModeStatusValidator,
	handler: observeSupportModeStatusHandler,
});

export const beginAdminSession = mutation({
	args: {
		subjectClerkUserId: v.string(),
		subjectEmail: nullableStringArg,
		reason: v.string(),
		...requestMetadataArgs,
	},
	returns: createImpersonationSessionResultValidator,
	handler: beginAdminImpersonationSessionHandler,
});

export const markCurrentSessionActive = mutation({
	args: {},
	returns: v.union(v.null(), v.any()),
	handler: markCurrentImpersonationSessionActiveHandler,
});

export const stopCurrentSession = mutation({
	args: {},
	returns: v.union(v.null(), v.any()),
	handler: stopCurrentImpersonationSessionHandler,
});

export const markAdminSessionStartFailed = mutation({
	args: {
		sessionId: v.id("impersonationSessions"),
		failureReason: impersonationFailureReasonValidator,
	},
	returns: v.union(v.null(), v.any()),
	handler: markAdminImpersonationSessionStartFailedHandler,
});

export const listAdminSessionHistory = query({
	args: {},
	returns: v.array(impersonationSessionHistoryItemValidator),
	handler: listAdminImpersonationSessionHistoryHandler,
});

export const createStartingSession = internalMutation({
	args: {
		actorClerkUserId: v.string(),
		actorEmail: v.string(),
		subjectClerkUserId: v.string(),
		subjectEmail: nullableStringArg,
		reason: v.string(),
		setupIntegrityIssues: v.optional(
			v.array(impersonationSetupIntegrityIssueValidator),
		),
		...requestMetadataArgs,
	},
	returns: createImpersonationSessionResultValidator,
	handler: createImpersonationSessionHandler,
});

export const markSessionActive = internalMutation({
	args: {
		sessionId: v.id("impersonationSessions"),
	},
	returns: v.union(v.null(), v.any()),
	handler: markImpersonationSessionActiveHandler,
});

export const markSessionStopped = internalMutation({
	args: {
		sessionId: v.id("impersonationSessions"),
	},
	returns: v.union(v.null(), v.any()),
	handler: markImpersonationSessionStoppedHandler,
});

export const markSessionStartFailed = internalMutation({
	args: {
		sessionId: v.id("impersonationSessions"),
		failureReason: impersonationFailureReasonValidator,
	},
	returns: v.union(v.null(), v.any()),
	handler: markImpersonationSessionStartFailedHandler,
});

export const appendAuditEvent = internalMutation({
	args: {
		sessionId: v.id("impersonationSessions"),
		eventType: impersonationAuditEventTypeValidator,
		actionId: v.string(),
		result: impersonationAuditResultValidator,
		actorClerkUserId: v.string(),
		actorEmail: v.string(),
		subjectClerkUserId: v.string(),
		subjectEmail: nullableStringArg,
		changedRecordIds: v.optional(v.union(v.array(v.string()), v.null())),
		blockReason: v.optional(
			v.union(impersonationBlockReasonValidator, v.null()),
		),
		failureReason: v.optional(
			v.union(impersonationFailureReasonValidator, v.null()),
		),
		setupIntegrityIssues: v.optional(
			v.array(impersonationSetupIntegrityIssueValidator),
		),
		createdAt: v.optional(v.number()),
		...requestMetadataArgs,
	},
	returns: v.id("impersonationAuditEvents"),
	handler: appendImpersonationAuditEventHandler,
});

const supportModeWritePolicyValidator = v.union(
	v.object({
		kind: v.literal("allowed"),
		sessionId: v.id("impersonationSessions"),
		actorClerkUserId: v.string(),
		subjectClerkUserId: v.string(),
	}),
	v.object({
		kind: v.literal("blocked"),
		blockReason: impersonationBlockReasonValidator,
	}),
	v.object({
		kind: v.literal("not_impersonating"),
	}),
);

export const evaluateSupportModeWritePolicy = internalMutation({
	args: { actionId: v.string() },
	returns: supportModeWritePolicyValidator,
	handler: evaluateSupportModeWritePolicyHandler,
});

const supportModeAuditResultValidator = v.union(
	v.object({
		kind: v.literal("recorded"),
		sessionId: v.id("impersonationSessions"),
	}),
	v.object({ kind: v.literal("not_impersonating") }),
	v.object({
		kind: v.literal("not_recorded"),
		reason: impersonationBlockReasonValidator,
	}),
);

export const appendSupportModeWriteSuccessAudit = mutation({
	args: {
		actionId: v.string(),
		changedRecordIds: v.optional(v.union(v.array(v.string()), v.null())),
	},
	returns: supportModeAuditResultValidator,
	handler: appendSupportModeWriteSuccessAuditHandler,
});

export const recordBlockedSupportModeAction = mutation({
	args: {
		actionId: v.string(),
		blockReason: impersonationBlockReasonValidator,
		eventType: impersonationAuditEventTypeValidator,
		...requestMetadataArgs,
	},
	returns: supportModeAuditResultValidator,
	handler: recordBlockedSupportModeActionHandler,
});

export const recordSupportModeDownloadAttempt = mutation({
	args: {
		actionId: v.string(),
		result: v.union(v.literal("success"), v.literal("blocked")),
		blockReason: v.optional(
			v.union(impersonationBlockReasonValidator, v.null()),
		),
		changedRecordIds: v.optional(v.union(v.array(v.string()), v.null())),
		...requestMetadataArgs,
	},
	returns: supportModeAuditResultValidator,
	handler: recordSupportModeDownloadAttemptHandler,
});
