import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const stripeWebhookEventStatusValidator = v.union(
	v.literal("processing"),
	v.literal("queued"),
	v.literal("processed"),
	v.literal("failed"),
	v.literal("ignored"),
	v.literal("payment_pending"),
);

const completedStripeWebhookEventStatuses = new Set([
	"processed",
	"ignored",
	"payment_pending",
]);
const duplicateBlockingStripeWebhookEventStatuses = new Set([
	...completedStripeWebhookEventStatuses,
	"processing",
	"queued",
]);
export const STRIPE_WEBHOOK_FULFILLMENT_MAX_ATTEMPTS = 3;
export const STRIPE_WEBHOOK_FULFILLMENT_STALE_MS = 5 * 60 * 1000;

export function getStripeWebhookFulfillmentRetryDelayMs(attemptCount: number) {
	return attemptCount <= 1 ? 30 * 1000 : 5 * 60 * 1000;
}

function isCompletedStripeWebhookEventStatus(status: string) {
	return completedStripeWebhookEventStatuses.has(status);
}

function isDuplicateBlockingStripeWebhookEventStatus(status: string) {
	return duplicateBlockingStripeWebhookEventStatuses.has(status);
}

async function getStripeWebhookEventByStripeEventId(
	ctx: MutationCtx,
	stripeEventId: string,
) {
	return ctx.db
		.query("stripeWebhookEvents")
		.withIndex("by_stripe_event_id", (query) =>
			query.eq("stripeEventId", stripeEventId),
		)
		.unique();
}

async function getTerminalStripeWebhookEventByObjectAndType(
	ctx: MutationCtx,
	args: {
		stripeEventId: string;
		eventType: string;
		stripeObjectId?: string;
	},
) {
	if (!args.stripeObjectId) {
		return null;
	}

	const matchingEvents = await ctx.db
		.query("stripeWebhookEvents")
		.withIndex("by_stripe_object_id_and_event_type", (query) =>
			query
				.eq("stripeObjectId", args.stripeObjectId)
				.eq("eventType", args.eventType),
		)
		.order("desc")
		.take(100);

	return (
		matchingEvents.find(
			(event) =>
				event.stripeEventId !== args.stripeEventId &&
				isDuplicateBlockingStripeWebhookEventStatus(event.status),
		) ?? null
	);
}

function shouldRecordStripeWebhookEventResult({
	existingEvent,
	attemptCount,
	status,
}: {
	existingEvent: {
		attemptCount: number;
		status: string;
	};
	attemptCount: number;
	status: string;
}) {
	if (existingEvent.status === "processed") {
		return false;
	}

	if (
		isCompletedStripeWebhookEventStatus(existingEvent.status) &&
		status !== existingEvent.status
	) {
		return false;
	}

	if (status === "processed") {
		return true;
	}

	return attemptCount >= existingEvent.attemptCount;
}

function assertStripeWebhookEventMatchesExisting(
	existingEvent: {
		eventType: string;
		stripeObjectId?: string;
	},
	args: {
		eventType: string;
		stripeObjectId?: string;
	},
) {
	if (existingEvent.eventType !== args.eventType) {
		throw new ConvexError("Stripe event id already has another event type");
	}

	if (
		existingEvent.stripeObjectId &&
		args.stripeObjectId &&
		existingEvent.stripeObjectId !== args.stripeObjectId
	) {
		throw new ConvexError("Stripe event id already belongs to another object");
	}
}

async function scheduleStripeWebhookFulfillmentAttempt(
	ctx: Pick<MutationCtx, "scheduler">,
	{
		stripeEventId,
		eventType,
		sessionId,
		attemptCount,
	}: {
		stripeEventId: string;
		eventType: string;
		sessionId: string;
		attemptCount: number;
	},
) {
	await ctx.scheduler.runAfter(
		0,
		internal.stripeWebhook.fulfillQueuedStripeWebhookEvent,
		{
			stripeEventId,
			eventType,
			sessionId,
			attemptCount,
		},
	);
	await ctx.scheduler.runAfter(
		STRIPE_WEBHOOK_FULFILLMENT_STALE_MS,
		internal.stripeWebhookEvents.retryStaleStripeWebhookEventFulfillment,
		{
			stripeEventId,
			eventType,
			sessionId,
			attemptCount,
		},
	);
}

export const beginStripeWebhookEventProcessing = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		stripeObjectId: v.optional(v.string()),
		courseSlug: v.optional(v.string()),
	},
	returns: v.union(
		v.object({
			decision: v.literal("process"),
			attemptCount: v.number(),
		}),
		v.object({
			decision: v.literal("skip"),
			status: stripeWebhookEventStatusValidator,
			resultKind: v.union(v.string(), v.null()),
		}),
	),
	handler: async (ctx, args) => {
		const now = Date.now();
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);

		if (existingEvent) {
			assertStripeWebhookEventMatchesExisting(existingEvent, args);

			if (isDuplicateBlockingStripeWebhookEventStatus(existingEvent.status)) {
				return {
					decision: "skip" as const,
					status: existingEvent.status,
					resultKind: existingEvent.resultKind ?? null,
				};
			}
		}

		const terminalLogicalDuplicate =
			await getTerminalStripeWebhookEventByObjectAndType(ctx, args);
		if (terminalLogicalDuplicate) {
			return {
				decision: "skip" as const,
				status: terminalLogicalDuplicate.status,
				resultKind: terminalLogicalDuplicate.resultKind ?? null,
			};
		}

		if (!existingEvent) {
			await ctx.db.insert("stripeWebhookEvents", {
				stripeEventId: args.stripeEventId,
				eventType: args.eventType,
				stripeObjectId: args.stripeObjectId,
				courseSlug: args.courseSlug,
				status: "processing",
				attemptCount: 1,
				firstSeenAt: now,
				updatedAt: now,
			});

			return {
				decision: "process" as const,
				attemptCount: 1,
			};
		}

		const attemptCount = existingEvent.attemptCount + 1;
		await ctx.db.patch(existingEvent._id, {
			status: "processing",
			stripeObjectId: args.stripeObjectId ?? existingEvent.stripeObjectId,
			courseSlug: args.courseSlug ?? existingEvent.courseSlug,
			errorMessage: undefined,
			attemptCount,
			updatedAt: now,
			completedAt: undefined,
		});

		return {
			decision: "process" as const,
			attemptCount,
		};
	},
});

export const queueStripeWebhookEventFulfillment = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		stripeObjectId: v.string(),
		courseSlug: v.optional(v.string()),
		attemptCount: v.number(),
	},
	returns: v.object({
		queued: v.union(v.literal("scheduled"), v.literal("skipped_stale")),
	}),
	handler: async (ctx, args) => {
		const now = Date.now();
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);
		if (!existingEvent) {
			await ctx.db.insert("stripeWebhookEvents", {
				stripeEventId: args.stripeEventId,
				eventType: args.eventType,
				stripeObjectId: args.stripeObjectId,
				courseSlug: args.courseSlug,
				status: "queued",
				resultKind: "queued",
				attemptCount: args.attemptCount,
				firstSeenAt: now,
				updatedAt: now,
			});
		} else {
			assertStripeWebhookEventMatchesExisting(existingEvent, args);
			if (isCompletedStripeWebhookEventStatus(existingEvent.status)) {
				return { queued: "skipped_stale" as const };
			}
			await ctx.db.patch(existingEvent._id, {
				stripeObjectId: args.stripeObjectId,
				courseSlug: args.courseSlug ?? existingEvent.courseSlug,
				status: "queued",
				resultKind: "queued",
				errorMessage: undefined,
				attemptCount: Math.max(existingEvent.attemptCount, args.attemptCount),
				updatedAt: now,
				completedAt: undefined,
			});
		}

		await scheduleStripeWebhookFulfillmentAttempt(ctx, {
			stripeEventId: args.stripeEventId,
			eventType: args.eventType,
			sessionId: args.stripeObjectId,
			attemptCount: args.attemptCount,
		});

		return { queued: "scheduled" as const };
	},
});

export const markStripeWebhookEventFulfillmentProcessing = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		stripeObjectId: v.string(),
		attemptCount: v.number(),
	},
	returns: v.object({
		marked: v.union(
			v.literal("processing"),
			v.literal("missing_event"),
			v.literal("skipped_stale"),
		),
	}),
	handler: async (ctx, args) => {
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);
		if (!existingEvent) {
			return { marked: "missing_event" as const };
		}

		assertStripeWebhookEventMatchesExisting(existingEvent, args);
		if (
			isCompletedStripeWebhookEventStatus(existingEvent.status) ||
			existingEvent.status === "failed" ||
			existingEvent.attemptCount !== args.attemptCount
		) {
			return { marked: "skipped_stale" as const };
		}

		await ctx.db.patch(existingEvent._id, {
			status: "processing",
			resultKind: "processing",
			errorMessage: undefined,
			updatedAt: Date.now(),
			completedAt: undefined,
		});

		return { marked: "processing" as const };
	},
});

export const retryFailedStripeWebhookEventFulfillment = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		sessionId: v.string(),
		failedAttemptCount: v.number(),
	},
	returns: v.object({
		retried: v.union(
			v.literal("scheduled"),
			v.literal("skipped_stale"),
			v.literal("max_attempts_reached"),
		),
	}),
	handler: async (ctx, args) => {
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);
		if (!existingEvent) {
			return { retried: "skipped_stale" as const };
		}

		assertStripeWebhookEventMatchesExisting(existingEvent, {
			eventType: args.eventType,
			stripeObjectId: args.sessionId,
		});
		if (
			existingEvent.status !== "failed" ||
			existingEvent.attemptCount !== args.failedAttemptCount
		) {
			return { retried: "skipped_stale" as const };
		}
		if (existingEvent.attemptCount >= STRIPE_WEBHOOK_FULFILLMENT_MAX_ATTEMPTS) {
			return { retried: "max_attempts_reached" as const };
		}

		const nextAttemptCount = existingEvent.attemptCount + 1;
		await ctx.db.patch(existingEvent._id, {
			status: "queued",
			resultKind: "queued",
			errorMessage: undefined,
			attemptCount: nextAttemptCount,
			updatedAt: Date.now(),
			completedAt: undefined,
		});
		await scheduleStripeWebhookFulfillmentAttempt(ctx, {
			stripeEventId: args.stripeEventId,
			eventType: args.eventType,
			sessionId: args.sessionId,
			attemptCount: nextAttemptCount,
		});

		return { retried: "scheduled" as const };
	},
});

export const retryStaleStripeWebhookEventFulfillment = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		sessionId: v.string(),
		attemptCount: v.number(),
	},
	returns: v.object({
		retried: v.union(
			v.literal("scheduled"),
			v.literal("skipped_stale"),
			v.literal("skipped_recent"),
			v.literal("max_attempts_reached"),
		),
	}),
	handler: async (ctx, args) => {
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);
		if (!existingEvent) {
			return { retried: "skipped_stale" as const };
		}

		assertStripeWebhookEventMatchesExisting(existingEvent, {
			eventType: args.eventType,
			stripeObjectId: args.sessionId,
		});
		if (
			(existingEvent.status !== "queued" &&
				existingEvent.status !== "processing") ||
			existingEvent.attemptCount !== args.attemptCount
		) {
			return { retried: "skipped_stale" as const };
		}
		if (
			Date.now() - existingEvent.updatedAt <
			STRIPE_WEBHOOK_FULFILLMENT_STALE_MS
		) {
			return { retried: "skipped_recent" as const };
		}
		if (existingEvent.attemptCount >= STRIPE_WEBHOOK_FULFILLMENT_MAX_ATTEMPTS) {
			await ctx.db.patch(existingEvent._id, {
				status: "failed",
				resultKind: "fulfillment_stale",
				errorMessage: "Queued Stripe webhook fulfillment did not complete.",
				updatedAt: Date.now(),
				completedAt: Date.now(),
			});
			return { retried: "max_attempts_reached" as const };
		}

		const nextAttemptCount = existingEvent.attemptCount + 1;
		await ctx.db.patch(existingEvent._id, {
			status: "queued",
			resultKind: "queued",
			errorMessage: undefined,
			attemptCount: nextAttemptCount,
			updatedAt: Date.now(),
			completedAt: undefined,
		});
		await scheduleStripeWebhookFulfillmentAttempt(ctx, {
			stripeEventId: args.stripeEventId,
			eventType: args.eventType,
			sessionId: args.sessionId,
			attemptCount: nextAttemptCount,
		});

		return { retried: "scheduled" as const };
	},
});

export const recordStripeWebhookEventResult = internalMutation({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		stripeObjectId: v.optional(v.string()),
		courseSlug: v.optional(v.string()),
		status: stripeWebhookEventStatusValidator,
		attemptCount: v.number(),
		resultKind: v.string(),
		errorMessage: v.optional(v.string()),
	},
	returns: v.object({
		recorded: v.union(
			v.literal("inserted"),
			v.literal("patched"),
			v.literal("skipped_stale"),
		),
	}),
	handler: async (ctx, args) => {
		const now = Date.now();
		const existingEvent = await getStripeWebhookEventByStripeEventId(
			ctx,
			args.stripeEventId,
		);

		if (!existingEvent) {
			await ctx.db.insert("stripeWebhookEvents", {
				stripeEventId: args.stripeEventId,
				eventType: args.eventType,
				stripeObjectId: args.stripeObjectId,
				courseSlug: args.courseSlug,
				status: args.status,
				resultKind: args.resultKind,
				errorMessage: args.errorMessage,
				attemptCount: args.attemptCount,
				firstSeenAt: now,
				updatedAt: now,
				completedAt: now,
			});

			return {
				recorded: "inserted" as const,
			};
		}

		assertStripeWebhookEventMatchesExisting(existingEvent, args);

		if (
			!shouldRecordStripeWebhookEventResult({
				existingEvent,
				attemptCount: args.attemptCount,
				status: args.status,
			})
		) {
			return {
				recorded: "skipped_stale" as const,
			};
		}

		await ctx.db.patch(existingEvent._id, {
			stripeObjectId: args.stripeObjectId ?? existingEvent.stripeObjectId,
			courseSlug: args.courseSlug ?? existingEvent.courseSlug,
			status: args.status,
			resultKind: args.resultKind,
			errorMessage: args.errorMessage,
			attemptCount: Math.max(existingEvent.attemptCount, args.attemptCount),
			updatedAt: now,
			completedAt: now,
		});

		return {
			recorded: "patched" as const,
		};
	},
});
