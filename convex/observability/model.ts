import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

import type {
	MutationCtx,
	QueryCtx,
	ActionCtx,
} from "../_generated/server";
import { internal } from "../_generated/api";
import {
	type ObservabilitySeverity,
} from "../../features/observability/lib/error-event";
import {
} from "./validators";
import { requireConvexEnv } from "../env";

const ALERT_COOLDOWN_MS = 5 * 60 * 1_000;
const MEDIUM_ALERT_THRESHOLD = 3;

type RecordObservedErrorArgs = {
	fingerprint: string;
	source: "next_server" | "next_client" | "convex" | "stripe" | "clerk" | "codex";
	message: string;
	stack?: string | null;
	details?: string | null;
	requestId?: string | null;
	pathname?: string | null;
	userId?: string | null;
	code?: string | null;
	severity: ObservabilitySeverity;
	environment: string;
};

export const getObservedErrorForAlertArgs = {
	eventId: v.id("errorEvents"),
};

export async function recordObservedErrorHandler(
	ctx: MutationCtx,
	args: RecordObservedErrorArgs,
) {
	const now = Date.now();
	const fingerprintKey = `${args.environment}:${args.fingerprint}`;
	const existing = await ctx.db
		.query("errorEvents")
		.withIndex("by_fingerprint_key", (queryBuilder) =>
			queryBuilder.eq("fingerprintKey", fingerprintKey),
		)
		.unique();
	const occurrenceCount = existing ? existing.occurrenceCount + 1 : 1;
	const shouldAlert = getShouldAlert({
		severity: args.severity,
		occurrenceCount,
		lastAlertAt: existing?.lastAlertAt,
	});

	const nextDocument = {
		fingerprint: args.fingerprint,
		fingerprintKey,
		source: args.source,
		severity: args.severity,
		message: args.message,
		code: args.code,
		requestId: args.requestId,
		pathname: args.pathname,
		userId: args.userId,
		environment: args.environment,
		stack: args.stack,
		details: args.details,
		occurrenceCount,
		firstSeenAt: existing?.firstSeenAt ?? now,
		lastSeenAt: now,
		alertStatus: shouldAlert ? "pending" : existing?.alertStatus ?? "suppressed",
		alertCount: existing?.alertCount ?? 0,
		lastAlertAt: existing?.lastAlertAt,
		telegramMessageId: existing?.telegramMessageId,
		lastAlertError: existing?.lastAlertError,
	};

	if (existing) {
		await ctx.db.patch(existing._id, nextDocument);

		return {
			eventId: existing._id,
			occurrenceCount,
			shouldAlert,
		};
	}

	const eventId = await ctx.db.insert("errorEvents", nextDocument);
	return {
		eventId,
		occurrenceCount,
		shouldAlert,
	};
}

export async function getObservedErrorForAlertHandler(
	ctx: QueryCtx,
	args: { eventId: Id<"errorEvents"> },
) {
	return await ctx.db.get(args.eventId);
}

export async function markObservedErrorAlertDeliveredHandler(
	ctx: MutationCtx,
	args: {
		eventId: Id<"errorEvents">;
		telegramMessageId: number;
	},
) {
	const existing = await ctx.db.get(args.eventId);
	await ctx.db.patch(args.eventId, {
		alertStatus: "delivered",
		telegramMessageId: args.telegramMessageId,
		lastAlertAt: Date.now(),
		lastAlertError: undefined,
		alertCount: (existing?.alertCount ?? 0) + 1,
	});
	return null;
}

export async function markObservedErrorAlertFailedHandler(
	ctx: MutationCtx,
	args: {
		eventId: Id<"errorEvents">;
		message: string;
	},
) {
	await ctx.db.patch(args.eventId, {
		alertStatus: "failed",
		lastAlertError: args.message,
	});
	return null;
}

export async function deliverObservedErrorAlertHandler(
	ctx: ActionCtx,
	args: { eventId: Id<"errorEvents"> },
) {
	const event = await ctx.runQuery(internal.observability.getObservedErrorForAlert, {
		eventId: args.eventId,
	});

	if (!event) {
		return null;
	}

	try {
		const messageText = buildTelegramMessage(event);
		const messageId = await sendTelegramMessage({
			messageText,
			existingMessageId: event.telegramMessageId ?? undefined,
		});

		await ctx.runMutation(
			internal.observability.markObservedErrorAlertDelivered,
			{
				eventId: args.eventId,
				telegramMessageId: messageId,
			},
		);
	} catch (error) {
		await ctx.runMutation(internal.observability.markObservedErrorAlertFailed, {
			eventId: args.eventId,
			message: error instanceof Error ? error.message : "Unknown Telegram error",
		});
	}

	return null;
}

function getShouldAlert({
	severity,
	occurrenceCount,
	lastAlertAt,
}: {
	severity: ObservabilitySeverity;
	occurrenceCount: number;
	lastAlertAt?: number;
}) {
	const threshold = severity === "medium" ? MEDIUM_ALERT_THRESHOLD : 1;
	if (occurrenceCount < threshold) {
		return false;
	}

	if (!lastAlertAt) {
		return true;
	}

	return Date.now() - lastAlertAt >= ALERT_COOLDOWN_MS;
}

function buildTelegramMessage(event: {
	_id: Id<"errorEvents">;
	fingerprint: string;
	severity: ObservabilitySeverity;
	source: string;
	environment: string;
	pathname?: string | null;
	requestId?: string | null;
	userId?: string | null;
	code?: string | null;
	message: string;
	details?: string | null;
	stack?: string | null;
	occurrenceCount: number;
	firstSeenAt: number;
	lastSeenAt: number;
}) {
	const packet = [
		"Investigate this production incident. Explain the most likely root cause, blast radius, and the smallest safe fix. If information is missing, say exactly what else you need.",
		"",
		"[packet]",
		`event_id: ${event._id}`,
		`fingerprint: ${event.fingerprint}`,
		`severity: ${event.severity}`,
		`source: ${event.source}`,
		`environment: ${event.environment}`,
		`path: ${event.pathname ?? "unknown"}`,
		`request_id: ${event.requestId ?? "unknown"}`,
		`user_id: ${event.userId ?? "anonymous"}`,
		`code: ${event.code ?? "none"}`,
		`occurrence_count: ${event.occurrenceCount}`,
		`first_seen_at: ${new Date(event.firstSeenAt).toISOString()}`,
		`last_seen_at: ${new Date(event.lastSeenAt).toISOString()}`,
		"",
		"message:",
		event.message,
		"",
		"details:",
		event.details ?? "none",
		"",
		"stack:",
		event.stack ?? "No stack trace available.",
	].join("\n");

	return trimTelegramMessage(packet);
}

async function sendTelegramMessage({
	messageText,
	existingMessageId,
}: {
	messageText: string;
	existingMessageId?: number;
}) {
	const botToken = requireConvexEnv("TELEGRAM_BOT_TOKEN");
	const chatId = requireConvexEnv("TELEGRAM_CHAT_ID");
	const baseUrl = `https://api.telegram.org/bot${botToken}`;
	const endpoint = existingMessageId ? "editMessageText" : "sendMessage";
	const payload = existingMessageId
		? {
				chat_id: chatId,
				message_id: existingMessageId,
				text: messageText,
			}
		: {
				chat_id: chatId,
				text: messageText,
			};
	const response = await fetch(`${baseUrl}/${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Telegram delivery failed with status ${response.status}.`);
	}

	const body = (await response.json()) as {
		result?: { message_id?: number };
	};

	return body.result?.message_id ?? existingMessageId ?? 0;
}

function trimTelegramMessage(message: string) {
	const maxLength = 3_900;
	if (message.length <= maxLength) {
		return message;
	}

	return `${message.slice(0, maxLength - 17)}\n\n[TRUNCATED FOR TELEGRAM]`;
}
