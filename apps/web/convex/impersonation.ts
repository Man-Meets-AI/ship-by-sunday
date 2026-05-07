import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import {
	appendImpersonationAuditEventHandler,
	createImpersonationSessionHandler,
	evaluateSupportModeWritePolicyHandler,
	getSupportModeStatusHandler,
	markImpersonationSessionActiveHandler,
	markImpersonationSessionStartFailedHandler,
	markImpersonationSessionStoppedHandler,
	observeSupportModeStatusHandler,
} from "./impersonation/model";
import {
	impersonationAuditEventTypeValidator,
	impersonationAuditResultValidator,
	impersonationBlockReasonValidator,
	impersonationFailureReasonValidator,
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
