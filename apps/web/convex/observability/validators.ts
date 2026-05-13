import { v } from "convex/values";

import {
	incidentEnvironmentValues,
	incidentSeverityValues,
	incidentSourceValues,
	incidentStatusValues,
	incidentSurfaceValues,
} from "../../src/lib/observability/incident";

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

export const incidentEnvironmentValidator = v.union(
	...incidentEnvironmentValues.map((value) => v.literal(value)),
);

export const incidentSourceValidator = v.union(
	...incidentSourceValues.map((value) => v.literal(value)),
);

export const incidentSurfaceValidator = v.union(
	...incidentSurfaceValues.map((value) => v.literal(value)),
);

export const incidentSeverityValidator = v.union(
	...incidentSeverityValues.map((value) => v.literal(value)),
);

export const incidentStatusValidator = v.union(
	...incidentStatusValues.map((value) => v.literal(value)),
);

export const incidentDeliveryStatusValidator = v.union(
	v.literal("pending"),
	v.literal("delivered"),
	v.literal("suppressed"),
	v.literal("failed"),
);

export const recordIncidentArgs = {
	product: v.string(),
	environment: incidentEnvironmentValidator,
	fingerprint: v.string(),
	source: incidentSourceValidator,
	surface: incidentSurfaceValidator,
	severity: incidentSeverityValidator,
	title: v.string(),
	summary: v.string(),
	code: v.optional(v.union(v.string(), v.null())),
	requestId: v.optional(v.union(v.string(), v.null())),
	pathname: v.optional(v.union(v.string(), v.null())),
	userId: v.optional(v.union(v.string(), v.null())),
	externalEventId: v.optional(v.union(v.string(), v.null())),
	deploymentId: v.optional(v.union(v.string(), v.null())),
	nativeUrl: v.optional(v.union(v.string(), v.null())),
	logsUrl: v.optional(v.union(v.string(), v.null())),
	nextAction: v.optional(v.union(v.string(), v.null())),
	stack: v.optional(v.union(v.string(), v.null())),
	details: v.optional(v.union(v.string(), v.null())),
};

export const incidentWriteResultValidator = v.object({
	incidentId: v.id("incidents"),
	occurrenceCount: v.number(),
	shouldNotify: v.boolean(),
});

export const updateIncidentStatusArgs = {
	incidentId: v.id("incidents"),
	status: incidentStatusValidator,
};

export const incidentDocumentValidator = v.object({
	_id: v.id("incidents"),
	_creationTime: v.number(),
	product: v.string(),
	fingerprint: v.string(),
	fingerprintKey: v.string(),
	source: incidentSourceValidator,
	surface: incidentSurfaceValidator,
	severity: incidentSeverityValidator,
	status: incidentStatusValidator,
	title: v.string(),
	summary: v.string(),
	code: v.optional(v.union(v.string(), v.null())),
	requestId: v.optional(v.union(v.string(), v.null())),
	pathname: v.optional(v.union(v.string(), v.null())),
	userId: v.optional(v.union(v.string(), v.null())),
	externalEventId: v.optional(v.union(v.string(), v.null())),
	deploymentId: v.optional(v.union(v.string(), v.null())),
	nativeUrl: v.optional(v.union(v.string(), v.null())),
	logsUrl: v.optional(v.union(v.string(), v.null())),
	nextAction: v.optional(v.union(v.string(), v.null())),
	environment: incidentEnvironmentValidator,
	stack: v.optional(v.union(v.string(), v.null())),
	details: v.optional(v.union(v.string(), v.null())),
	occurrenceCount: v.number(),
	firstSeenAt: v.number(),
	lastSeenAt: v.number(),
	deliveryStatus: incidentDeliveryStatusValidator,
	deliveryCount: v.number(),
	lastDeliveryAt: v.optional(v.number()),
	telegramMessageId: v.optional(v.number()),
	telegramThreadId: v.optional(v.number()),
	lastDeliveryError: v.optional(v.string()),
	latestOccurrenceId: v.optional(v.id("incidentOccurrences")),
});

export const incidentOccurrenceDocumentValidator = v.object({
	_id: v.id("incidentOccurrences"),
	_creationTime: v.number(),
	incidentId: v.id("incidents"),
	product: v.string(),
	fingerprint: v.string(),
	fingerprintKey: v.string(),
	source: incidentSourceValidator,
	surface: incidentSurfaceValidator,
	severity: incidentSeverityValidator,
	title: v.string(),
	summary: v.string(),
	code: v.optional(v.union(v.string(), v.null())),
	requestId: v.optional(v.union(v.string(), v.null())),
	pathname: v.optional(v.union(v.string(), v.null())),
	userId: v.optional(v.union(v.string(), v.null())),
	externalEventId: v.optional(v.union(v.string(), v.null())),
	deploymentId: v.optional(v.union(v.string(), v.null())),
	nativeUrl: v.optional(v.union(v.string(), v.null())),
	logsUrl: v.optional(v.union(v.string(), v.null())),
	nextAction: v.optional(v.union(v.string(), v.null())),
	environment: incidentEnvironmentValidator,
	stack: v.optional(v.union(v.string(), v.null())),
	details: v.optional(v.union(v.string(), v.null())),
	occurrenceNumber: v.number(),
	occurredAt: v.number(),
});
