import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type {
	NormalizedIncidentEvent,
	IncidentEnvironment,
	IncidentSeverity,
	IncidentSource,
	IncidentSurface,
} from "../../features/observability/lib/incident";
import { normalizeIncidentEvent as createNormalizedIncidentEvent } from "../../features/observability/lib/incident";
import { renderIncidentMessage } from "../../features/observability/telegram/render-incident-message";
import { requireConvexEnv } from "../env";

const DELIVERY_COOLDOWN_MS = 5 * 60 * 1_000;
const MEDIUM_DELIVERY_THRESHOLD = 3;

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
	const shouldNotify = getShouldNotify({
		source: args.source,
		severity: args.severity,
		occurrenceCount,
		lastDeliveryAt: existing?.lastDeliveryAt,
		status,
	});

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
		await ctx.db.patch(existing._id, nextDocument);

		return {
			incidentId: existing._id,
			occurrenceCount,
			shouldNotify,
		};
	}

	const incidentId = await ctx.db.insert("incidents", nextDocument);
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
	ctx: ActionCtx,
	args: { incidentId: Id<"incidents"> },
) {
	const incident = await ctx.runQuery(
		internal.observability.getIncidentForNotification,
		{
			incidentId: args.incidentId,
		},
	);

	if (!incident) {
		return null;
	}

	if (incident.source === "telegram_delivery") {
		return null;
	}

	try {
		const delivery = await sendTelegramMessage({
			messageText: renderIncidentMessage(incident),
			existingMessageId: incident.telegramMessageId ?? undefined,
			existingThreadId: incident.telegramThreadId ?? undefined,
		});

		await ctx.runMutation(
			internal.observability.markIncidentNotificationDelivered,
			{
				incidentId: args.incidentId,
				telegramMessageId: delivery.messageId,
				telegramThreadId: delivery.messageThreadId ?? null,
			},
		);
	} catch (error) {
		const deliveryErrorMessage =
			error instanceof Error ? error.message : "Unknown Telegram error";
		await ctx.runMutation(
			internal.observability.markIncidentNotificationFailed,
			{
				incidentId: args.incidentId,
				message: deliveryErrorMessage,
			},
		);

		try {
			await ctx.runMutation(
				internal.observability.recordIncident,
				buildTelegramDeliveryIncident({
					sourceIncident: incident,
					deliveryErrorMessage,
				}),
			);
		} catch (recordError) {
			console.error(
				"telegram delivery failure incident recording failed",
				recordError,
			);
		}
	}

	return null;
}

function getShouldNotify({
	source,
	severity,
	occurrenceCount,
	lastDeliveryAt,
	status,
}: {
	source: IncidentSource;
	severity: IncidentSeverity;
	occurrenceCount: number;
	lastDeliveryAt?: number;
	status: "firing" | "acked" | "muted" | "resolved" | "regressed";
}) {
	if (source === "telegram_delivery") {
		return false;
	}

	if (status === "muted" || status === "acked") {
		return false;
	}

	const threshold = severity === "medium" ? MEDIUM_DELIVERY_THRESHOLD : 1;
	if (occurrenceCount < threshold) {
		return false;
	}

	if (!lastDeliveryAt) {
		return true;
	}

	return Date.now() - lastDeliveryAt >= DELIVERY_COOLDOWN_MS;
}

async function sendTelegramMessage({
	messageText,
	existingMessageId,
	existingThreadId,
}: {
	messageText: string;
	existingMessageId?: number;
	existingThreadId?: number;
}) {
	const botToken = requireConvexEnv("TELEGRAM_BOT_TOKEN");
	const chatId = requireConvexEnv("TELEGRAM_CHAT_ID");
	const baseUrl = `https://api.telegram.org/bot${botToken}`;
	const editResponse = existingMessageId
		? await fetch(`${baseUrl}/editMessageText`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chat_id: chatId,
					message_id: existingMessageId,
					text: messageText,
				}),
			})
		: null;

	if (editResponse) {
		const editResult = await parseTelegramResponse(editResponse);
		if (editResult.ok) {
			return {
				messageId: editResult.messageId ?? existingMessageId ?? 0,
				messageThreadId: editResult.messageThreadId ?? existingThreadId ?? null,
			};
		}

		if (editResult.error.includes("message is not modified")) {
			return {
				messageId: existingMessageId ?? 0,
				messageThreadId: existingThreadId ?? null,
			};
		}
	}

	const response = await fetch(`${baseUrl}/sendMessage`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			chat_id: chatId,
			message_thread_id: existingThreadId,
			text: messageText,
		}),
	});
	const sendResult = await parseTelegramResponse(response);
	if (!sendResult.ok) {
		throw new Error(sendResult.error);
	}

	return {
		messageId: sendResult.messageId ?? existingMessageId ?? 0,
		messageThreadId: sendResult.messageThreadId ?? existingThreadId ?? null,
	};
}

async function parseTelegramResponse(response: Response) {
	const bodyText = await response.text();
	let parsedBody: {
		description?: string;
		result?: { message_id?: number; message_thread_id?: number };
	} | null = null;
	try {
		parsedBody = JSON.parse(bodyText) as {
			description?: string;
			result?: { message_id?: number; message_thread_id?: number };
		};
	} catch {
		parsedBody = null;
	}

	if (!response.ok) {
		const description = parsedBody?.description ?? bodyText.trim();
		return {
			ok: false as const,
			error: `Telegram delivery failed with status ${response.status}${description ? `: ${description}` : "."}`,
		};
	}

	return {
		ok: true as const,
		messageId: parsedBody?.result?.message_id,
		messageThreadId: parsedBody?.result?.message_thread_id,
	};
}

function buildTelegramDeliveryIncident({
	sourceIncident,
	deliveryErrorMessage,
}: {
	sourceIncident: Doc<"incidents">;
	deliveryErrorMessage: string;
}): NormalizedIncidentEvent {
	const classifiedFailure = classifyTelegramDeliveryFailure({
		deliveryErrorMessage,
		sourceIncidentId: sourceIncident._id,
	});

	const normalizedIncident = createNormalizedIncidentEvent({
		source: "telegram_delivery",
		error: new Error(classifiedFailure.title),
		pathname: sourceIncident.pathname,
		code: classifiedFailure.code,
		severity: "critical",
		surface: "delivery",
		externalEventId: classifiedFailure.externalEventId,
		nextAction: classifiedFailure.nextAction,
		details: {
			deliveryError: deliveryErrorMessage,
			failureClass: classifiedFailure.failureClass,
			sourceIncidentId: sourceIncident._id,
			sourceIncidentFingerprint: sourceIncident.fingerprint,
			sourceIncidentSource: sourceIncident.source,
			sourceIncidentStatus: sourceIncident.status,
			sourceIncidentPathname: sourceIncident.pathname,
			telegramMessageId: sourceIncident.telegramMessageId,
			telegramThreadId: sourceIncident.telegramThreadId,
		},
	});

	return {
		...normalizedIncident,
		product: sourceIncident.product,
		environment: sourceIncident.environment,
	};
}

function classifyTelegramDeliveryFailure({
	deliveryErrorMessage,
	sourceIncidentId,
}: {
	deliveryErrorMessage: string;
	sourceIncidentId: Id<"incidents">;
}) {
	const normalizedMessage = deliveryErrorMessage.toLowerCase();

	if (
		normalizedMessage.includes("status 429") ||
		normalizedMessage.includes("too many requests") ||
		normalizedMessage.includes("retry after")
	) {
		return {
			code: "telegram_delivery_rate_limited",
			externalEventId: "telegram_delivery_rate_limited",
			failureClass: "rate_limited" as const,
			nextAction:
				"Wait for Telegram rate limits to reset, then confirm alerts can send again before relying on chat delivery.",
			title: "Telegram delivery rate-limited.",
		};
	}

	if (
		normalizedMessage.includes("status 401") ||
		normalizedMessage.includes("status 403") ||
		normalizedMessage.includes("forbidden") ||
		normalizedMessage.includes("unauthorized") ||
		normalizedMessage.includes("chat not found") ||
		normalizedMessage.includes("bot was blocked")
	) {
		return {
			code: "telegram_delivery_authorization_failed",
			externalEventId: "telegram_delivery_authorization_failed",
			failureClass: "authorization_failed" as const,
			nextAction:
				"Restore the Telegram bot token, chat membership, and bot permissions before relying on alerts.",
			title: "Telegram delivery authorization failed.",
		};
	}

	if (
		normalizedMessage.includes("message is too long") ||
		normalizedMessage.includes("message text is empty") ||
		normalizedMessage.includes("can't parse entities") ||
		normalizedMessage.includes("message to edit not found")
	) {
		return {
			code: "telegram_delivery_content_rejected",
			externalEventId: `telegram_delivery_content_rejected:${sourceIncidentId}`,
			failureClass: "content_rejected" as const,
			nextAction:
				"Inspect the source incident packet and trim or repair the Telegram message payload before retrying delivery.",
			title: "Telegram delivery rejected incident content.",
		};
	}

	return {
		code: "telegram_delivery_failed",
		externalEventId: `telegram_delivery_failed:${sourceIncidentId}`,
		failureClass: "delivery_failed" as const,
		nextAction:
			"Inspect the source incident delivery metadata and the Telegram API error before retrying delivery.",
		title: "Telegram delivery failed.",
	};
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
