import { v } from "convex/values";

export const codexRateLimitWindowValidator = v.union(
	v.object({
		usedPercent: v.number(),
		windowDurationMins: v.union(v.number(), v.null()),
		resetsAt: v.union(v.number(), v.null()),
	}),
	v.null(),
);

export const codexRateLimitCreditsValidator = v.union(
	v.object({
		hasCredits: v.boolean(),
		unlimited: v.boolean(),
		balance: v.string(),
	}),
	v.null(),
);

export const codexRateLimitSnapshotValidator = v.object({
	limitId: v.union(v.string(), v.null()),
	limitName: v.union(v.string(), v.null()),
	primary: codexRateLimitWindowValidator,
	secondary: codexRateLimitWindowValidator,
	credits: codexRateLimitCreditsValidator,
	planType: v.union(v.string(), v.null()),
});

export const codexRateLimitSnapshotsByIdValidator = v.union(
	v.record(v.string(), codexRateLimitSnapshotValidator),
	v.null(),
);

export const codexConnectionDocumentValidator = v.object({
	_id: v.id("codexConnections"),
	_creationTime: v.number(),
	clerkUserId: v.string(),
	authMode: v.literal("managed_chatgpt"),
	accountId: v.optional(v.string()),
	planType: v.optional(v.string()),
	connectedAt: v.optional(v.number()),
	status: v.union(
		v.literal("connecting"),
		v.literal("connected"),
		v.literal("disconnected"),
		v.literal("error"),
	),
	lastRateLimitSnapshot: v.optional(codexRateLimitSnapshotsByIdValidator),
	updatedAt: v.number(),
});

export const codexConnectionReturnValidator = v.union(
	codexConnectionDocumentValidator,
	v.null(),
);

export const codexConnectionWriteResultValidator = v.object({
	connectionId: v.id("codexConnections"),
	updatedAt: v.number(),
	mode: v.union(v.literal("inserted"), v.literal("patched")),
});

export const codexRunWriteResultValidator = v.object({
	runId: v.id("codexRuns"),
	createdAt: v.number(),
});
