import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type {
	IncidentEnvironment,
	IncidentSeverity,
	IncidentSource,
	IncidentSurface,
} from "../../lib/observability/incident";

type RecordIncidentArgs = {
	product: string;
	environment: IncidentEnvironment;
	fingerprint: string;
	source: IncidentSource;
	surface: IncidentSurface;
	severity: IncidentSeverity;
	title: string;
	summary: string;
	code?: string | null;
	requestId?: string | null;
	pathname?: string | null;
	userId?: string | null;
	externalEventId?: string | null;
	deploymentId?: string | null;
	nativeUrl?: string | null;
	logsUrl?: string | null;
	nextAction?: string | null;
	stack?: string | null;
	details?: string | null;
};

export const getIncidentForNotificationArgs = {
	incidentId: v.id("incidents"),
};

function buildIncidentOccurrenceDocument({
	args,
	incidentId,
	occurredAt,
	occurrenceNumber,
}: {
	args: RecordIncidentArgs;
	incidentId: Id<"incidents">;
	occurredAt: number;
	occurrenceNumber: number;
}): Omit<Doc<"incidentOccurrences">, "_id" | "_creationTime"> {
	const fingerprintKey = `${args.product}:${args.environment}:${args.fingerprint}`;

	return {
		incidentId,
		product: args.product,
		fingerprint: args.fingerprint,
		fingerprintKey,
		source: args.source,
		surface: args.surface,
		severity: args.severity,
		title: args.title,
		summary: args.summary,
		code: args.code,
		requestId: args.requestId,
		pathname: args.pathname,
		userId: args.userId,
		externalEventId: args.externalEventId,
		deploymentId: args.deploymentId,
		nativeUrl: args.nativeUrl,
		logsUrl: args.logsUrl,
		nextAction: args.nextAction,
		environment: args.environment,
		stack: args.stack,
		details: args.details,
		occurrenceNumber,
		occurredAt,
	};
}

export async function recordIncidentHandler(
	ctx: MutationCtx,
	args: RecordIncidentArgs,
) {
	const now = Date.now();
	const fingerprintKey = `${args.product}:${args.environment}:${args.fingerprint}`;
	const existing = await ctx.db
		.query("incidents")
		.withIndex("by_fingerprint_key", (queryBuilder) =>
			queryBuilder.eq("fingerprintKey", fingerprintKey),
		)
		.unique();
	const occurrenceCount = existing ? existing.occurrenceCount + 1 : 1;
	const status: Doc<"incidents">["status"] =
		existing?.status === "resolved"
			? "regressed"
			: existing?.status === "muted"
				? "muted"
				: existing?.status === "acked"
					? "acked"
					: "firing";
	const shouldNotify = getShouldNotify();

	const nextDocument: Omit<Doc<"incidents">, "_id" | "_creationTime"> = {
		product: args.product,
		fingerprint: args.fingerprint,
		fingerprintKey,
		source: args.source,
		surface: args.surface,
		severity: args.severity,
		status,
		title: args.title,
		summary: args.summary,
		code: args.code,
		requestId: args.requestId,
		pathname: args.pathname,
		userId: args.userId,
		externalEventId: args.externalEventId,
		deploymentId: args.deploymentId,
		nativeUrl: args.nativeUrl,
		logsUrl: args.logsUrl,
		nextAction: args.nextAction,
		environment: args.environment,
		stack: args.stack,
		details: args.details,
		occurrenceCount,
		firstSeenAt: existing?.firstSeenAt ?? now,
		lastSeenAt: now,
		deliveryStatus: shouldNotify
			? "pending"
			: (existing?.deliveryStatus ?? "suppressed"),
		deliveryCount: existing?.deliveryCount ?? 0,
		lastDeliveryAt: existing?.lastDeliveryAt,
		telegramMessageId: existing?.telegramMessageId,
		telegramThreadId: existing?.telegramThreadId,
		lastDeliveryError: existing?.lastDeliveryError,
	};

	if (existing) {
		const latestOccurrenceId = await ctx.db.insert(
			"incidentOccurrences",
			buildIncidentOccurrenceDocument({
				args,
				incidentId: existing._id,
				occurredAt: now,
				occurrenceNumber: occurrenceCount,
			}),
		);
		await ctx.db.patch(existing._id, {
			...nextDocument,
			latestOccurrenceId,
		});

		return {
			incidentId: existing._id,
			occurrenceCount,
			shouldNotify,
		};
	}

	const incidentId = await ctx.db.insert("incidents", nextDocument);
	const latestOccurrenceId = await ctx.db.insert(
		"incidentOccurrences",
		buildIncidentOccurrenceDocument({
			args,
			incidentId,
			occurredAt: now,
			occurrenceNumber: occurrenceCount,
		}),
	);
	await ctx.db.patch(incidentId, { latestOccurrenceId });

	return {
		incidentId,
		occurrenceCount,
		shouldNotify,
	};
}

export async function getIncidentForNotificationHandler(
	ctx: QueryCtx,
	args: { incidentId: Id<"incidents"> },
) {
	return await ctx.db.get(args.incidentId);
}

export async function listIncidentsForEngineeringIntakeHandler(
	ctx: QueryCtx,
	args: {
		paginationOpts: {
			cursor: string | null;
			numItems: number;
		};
	},
) {
	return await ctx.db
		.query("incidents")
		.order("desc")
		.paginate(args.paginationOpts);
}

export async function listIncidentOccurrencesForEngineeringIntakeHandler(
	ctx: QueryCtx,
	args: {
		paginationOpts: {
			cursor: string | null;
			numItems: number;
		};
	},
) {
	return await ctx.db
		.query("incidentOccurrences")
		.order("desc")
		.paginate(args.paginationOpts);
}

export async function markIncidentNotificationDeliveredHandler(
	ctx: MutationCtx,
	args: {
		incidentId: Id<"incidents">;
		telegramMessageId: number;
		telegramThreadId?: number | null;
	},
) {
	const existing = await ctx.db.get(args.incidentId);
	await ctx.db.patch(args.incidentId, {
		deliveryStatus: "delivered",
		telegramMessageId: args.telegramMessageId,
		telegramThreadId: args.telegramThreadId ?? undefined,
		lastDeliveryAt: Date.now(),
		lastDeliveryError: undefined,
		deliveryCount: (existing?.deliveryCount ?? 0) + 1,
	});
	return null;
}

export async function markIncidentNotificationFailedHandler(
	ctx: MutationCtx,
	args: {
		incidentId: Id<"incidents">;
		message: string;
	},
) {
	await ctx.db.patch(args.incidentId, {
		deliveryStatus: "failed",
		lastDeliveryError: args.message,
	});
	return null;
}

export async function deliverIncidentNotificationHandler(
	_ctx: ActionCtx,
	_args: { incidentId: Id<"incidents"> },
) {
	return null;
}

function getShouldNotify() {
	return false;
}

export async function updateIncidentStatusHandler(
	ctx: MutationCtx,
	args: {
		incidentId: Id<"incidents">;
		status: Doc<"incidents">["status"];
	},
) {
	await ctx.db.patch(args.incidentId, {
		status: args.status,
	});

	return null;
}
