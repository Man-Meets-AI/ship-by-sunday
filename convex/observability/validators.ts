import { v } from "convex/values";

export const observabilitySourceValidator = v.union(
	v.literal("next_server"),
	v.literal("next_client"),
	v.literal("convex"),
	v.literal("stripe"),
	v.literal("clerk"),
	v.literal("codex"),
);

export const observabilitySeverityValidator = v.union(
	v.literal("medium"),
	v.literal("high"),
	v.literal("critical"),
);

export const observabilityAlertStatusValidator = v.union(
	v.literal("pending"),
	v.literal("delivered"),
	v.literal("suppressed"),
	v.literal("failed"),
);

export const recordObservedErrorArgs = {
	fingerprint: v.string(),
	source: observabilitySourceValidator,
	message: v.string(),
	stack: v.optional(v.union(v.string(), v.null())),
	details: v.optional(v.union(v.string(), v.null())),
	requestId: v.optional(v.union(v.string(), v.null())),
	pathname: v.optional(v.union(v.string(), v.null())),
	userId: v.optional(v.union(v.string(), v.null())),
	code: v.optional(v.union(v.string(), v.null())),
	severity: observabilitySeverityValidator,
	environment: v.string(),
};

export const observedErrorWriteResultValidator = v.object({
	eventId: v.id("errorEvents"),
	occurrenceCount: v.number(),
	shouldAlert: v.boolean(),
});

export const observedErrorDocumentValidator = v.object({
	_id: v.id("errorEvents"),
	_creationTime: v.number(),
	fingerprint: v.string(),
	fingerprintKey: v.string(),
	source: observabilitySourceValidator,
	severity: observabilitySeverityValidator,
	message: v.string(),
	code: v.optional(v.union(v.string(), v.null())),
	requestId: v.optional(v.union(v.string(), v.null())),
	pathname: v.optional(v.union(v.string(), v.null())),
	userId: v.optional(v.union(v.string(), v.null())),
	environment: v.string(),
	stack: v.optional(v.union(v.string(), v.null())),
	details: v.optional(v.union(v.string(), v.null())),
	occurrenceCount: v.number(),
	firstSeenAt: v.number(),
	lastSeenAt: v.number(),
	alertStatus: observabilityAlertStatusValidator,
	alertCount: v.number(),
	lastAlertAt: v.optional(v.number()),
	telegramMessageId: v.optional(v.number()),
	lastAlertError: v.optional(v.string()),
});
