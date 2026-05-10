import { z } from "zod";
import type { GenericId } from "convex/values";

import { requireConvexEnv } from "../env";
import type { SupportDeliveryFailureClass } from "./types";
import {
	parseSupportActionCallbackData,
	parseSupportDraftDecisionCallbackData,
	type SupportDraftDecision,
	type SupportOperatorActionType,
} from "./operatorActions";

const TELEGRAM_API_BASE_URL = "https://api.telegram.org";
const TELEGRAM_OPERATOR_REPLY_MAX_LENGTH = 2_000;

const telegramChatSchema = z.object({
	id: z.union([z.number(), z.string()]),
});

const telegramUserSchema = z.object({
	id: z.number(),
	is_bot: z.boolean().optional(),
});

const telegramMessageSchema = z.object({
	message_id: z.number(),
	message_thread_id: z.number().optional(),
	chat: telegramChatSchema,
	from: telegramUserSchema.optional(),
	text: z.string().optional(),
});

const telegramCallbackQuerySchema = z.object({
	id: z.string(),
	from: telegramUserSchema,
	message: telegramMessageSchema.optional(),
	data: z.string().optional(),
});

const telegramUpdateSchema = z.object({
	update_id: z.number(),
	message: telegramMessageSchema.optional(),
	callback_query: telegramCallbackQuerySchema.optional(),
});

export type ParsedTelegramSupportUpdate =
	| {
			kind: "operator_message";
			updateId: number;
			chatId: string;
			messageThreadId: number;
			telegramMessageId: number;
			operatorTelegramUserId: number;
			text: string;
	  }
	| {
			kind: "operator_action";
			updateId: number;
			callbackQueryId: string;
			chatId: string;
			messageThreadId: number;
			operatorTelegramUserId: number;
			supportId: string;
			actionType: SupportOperatorActionType;
	  }
	| {
			kind: "draft_decision";
			updateId: number;
			callbackQueryId: string;
			chatId: string;
			messageThreadId: number;
			operatorTelegramUserId: number;
			operatorActionId: GenericId<"supportOperatorActions">;
			decision: SupportDraftDecision;
	  }
	| {
			kind: "ignored";
			reason: string;
			callbackQueryId?: string;
			callbackAnswerText?: string;
	  };

type TelegramApiResult =
	| {
			ok: true;
			messageId?: number;
			messageThreadId?: number;
	  }
	| {
			ok: false;
			error: string;
			status: number;
	  };

export function parseTelegramSupportOperatorIds(rawValue: string) {
	return rawValue
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean)
		.map((value) => Number(value))
		.filter((value) => Number.isSafeInteger(value));
}

export function parseTelegramSupportUpdate(
	payload: unknown,
	operatorUserIds: readonly number[],
	expectedChatId: string,
): ParsedTelegramSupportUpdate {
	const parsed = telegramUpdateSchema.safeParse(payload);
	if (!parsed.success) {
		return createIgnoredTelegramUpdate("unsupported_update_shape");
	}

	const update = parsed.data;
	if (update.message) {
		const message = update.message;
		const chatId = String(message.chat.id);
		if (chatId !== expectedChatId) {
			return createIgnoredTelegramUpdate("unknown_chat");
		}
		if (!message.from || message.from.is_bot) {
			return createIgnoredTelegramUpdate("bot_or_missing_operator");
		}
		if (!operatorUserIds.includes(message.from.id)) {
			return createIgnoredTelegramUpdate("unknown_operator");
		}
		if (!message.message_thread_id) {
			return createIgnoredTelegramUpdate("missing_topic");
		}
		const text = message.text?.trim();
		if (!text || text.startsWith("/")) {
			return createIgnoredTelegramUpdate("unsupported_message");
		}
		if (text.length > TELEGRAM_OPERATOR_REPLY_MAX_LENGTH) {
			return createIgnoredTelegramUpdate("operator_reply_too_long");
		}

		return {
			kind: "operator_message",
			updateId: update.update_id,
			chatId,
			messageThreadId: message.message_thread_id,
			telegramMessageId: message.message_id,
			operatorTelegramUserId: message.from.id,
			text,
		};
	}

	if (update.callback_query) {
		const callback = update.callback_query;
		const message = callback.message;
		if (!message) {
			return createIgnoredCallbackUpdate(
				"missing_callback_message",
				callback.id,
			);
		}
		const chatId = String(message.chat.id);
		if (chatId !== expectedChatId) {
			return createIgnoredCallbackUpdate("unknown_chat", callback.id);
		}
		if (!operatorUserIds.includes(callback.from.id)) {
			return createIgnoredCallbackUpdate("unknown_operator", callback.id);
		}
		if (callback.from.is_bot) {
			return createIgnoredCallbackUpdate("bot_operator", callback.id);
		}
		if (!message.message_thread_id) {
			return createIgnoredCallbackUpdate("missing_topic", callback.id);
		}
		const parsedCallbackData = parseSupportActionCallbackData(
			callback.data ?? "",
		);
		if (parsedCallbackData) {
			return {
				kind: "operator_action",
				updateId: update.update_id,
				callbackQueryId: callback.id,
				chatId,
				messageThreadId: message.message_thread_id,
				operatorTelegramUserId: callback.from.id,
				supportId: parsedCallbackData.supportId,
				actionType: parsedCallbackData.actionType,
			};
		}
		const parsedDraftDecision = parseSupportDraftDecisionCallbackData(
			callback.data ?? "",
		);
		if (!parsedDraftDecision) {
			return createIgnoredCallbackUpdate("unsupported_callback", callback.id);
		}

		return {
			kind: "draft_decision",
			updateId: update.update_id,
			callbackQueryId: callback.id,
			chatId,
			messageThreadId: message.message_thread_id,
			operatorTelegramUserId: callback.from.id,
			operatorActionId: parsedDraftDecision.operatorActionId,
			decision: parsedDraftDecision.decision,
		};
	}

	return createIgnoredTelegramUpdate("unsupported_update_shape");
}

function createIgnoredTelegramUpdate(
	reason: string,
): ParsedTelegramSupportUpdate {
	return { kind: "ignored", reason };
}

function createIgnoredCallbackUpdate(
	reason: string,
	callbackQueryId: string,
): ParsedTelegramSupportUpdate {
	return {
		kind: "ignored",
		reason,
		callbackQueryId,
		callbackAnswerText: "Action unavailable.",
	};
}

export function classifySupportDeliveryError(
	error: unknown,
): SupportDeliveryFailureClass {
	const message = error instanceof Error ? error.message.toLowerCase() : "";
	if (message.includes("missing required convex environment variable")) {
		return "missing_provider_config";
	}
	if (
		message.includes("not enough rights") ||
		message.includes("can't create topic") ||
		message.includes("forum") ||
		message.includes("topic")
	) {
		return "topic_permission_failed";
	}
	if (
		message.includes("status 401") ||
		message.includes("status 403") ||
		message.includes("unauthorized") ||
		message.includes("forbidden") ||
		message.includes("chat not found")
	) {
		return "authorization_failed";
	}
	if (message.includes("status 429") || message.includes("too many requests")) {
		return "rate_limited";
	}
	if (
		message.includes("message text is empty") ||
		message.includes("message is too long") ||
		message.includes("can't parse")
	) {
		return "content_rejected";
	}
	if (message.includes("fetch failed") || message.includes("network")) {
		return "network_error";
	}

	return "provider_error";
}

export async function createTelegramSupportTopic(name: string) {
	const result = await postTelegramSupportMethod("createForumTopic", {
		chat_id: requireConvexEnv("TELEGRAM_SUPPORT_CHAT_ID"),
		name,
	});

	if (!result.ok || !result.messageThreadId) {
		throw new Error(
			result.ok ? "Telegram did not return a forum topic id." : result.error,
		);
	}

	return {
		messageThreadId: result.messageThreadId,
	};
}

export async function sendTelegramSupportMessage({
	messageThreadId,
	text,
	replyMarkup,
}: {
	messageThreadId: number;
	text: string;
	replyMarkup?: unknown;
}) {
	const result = await postTelegramSupportMethod("sendMessage", {
		chat_id: requireConvexEnv("TELEGRAM_SUPPORT_CHAT_ID"),
		message_thread_id: messageThreadId,
		text,
		reply_markup: replyMarkup,
	});

	if (!result.ok || !result.messageId) {
		throw new Error(
			result.ok ? "Telegram did not return a message id." : result.error,
		);
	}

	return {
		messageId: result.messageId,
		messageThreadId: result.messageThreadId ?? messageThreadId,
	};
}

export async function sendTelegramSupportPhoto({
	messageThreadId,
	photoUrl,
	caption,
}: {
	messageThreadId: number;
	photoUrl: string;
	caption: string;
}) {
	const result = await postTelegramSupportMethod("sendPhoto", {
		chat_id: requireConvexEnv("TELEGRAM_SUPPORT_CHAT_ID"),
		message_thread_id: messageThreadId,
		photo: photoUrl,
		caption,
	});

	if (!result.ok || !result.messageId) {
		throw new Error(
			result.ok ? "Telegram did not return a message id." : result.error,
		);
	}

	return {
		messageId: result.messageId,
		messageThreadId: result.messageThreadId ?? messageThreadId,
	};
}

export async function answerTelegramSupportCallbackQuery(
	callbackQueryId: string,
	text: string,
) {
	const result = await postTelegramSupportMethod("answerCallbackQuery", {
		callback_query_id: callbackQueryId,
		text,
	});

	if (!result.ok) {
		throw new Error(result.error);
	}
}

export async function deleteTelegramSupportTopic(messageThreadId: number) {
	const result = await postTelegramSupportMethod("deleteForumTopic", {
		chat_id: requireConvexEnv("TELEGRAM_SUPPORT_CHAT_ID"),
		message_thread_id: messageThreadId,
	});

	if (!result.ok) {
		throw new Error(result.error);
	}
}

async function postTelegramSupportMethod(
	method: string,
	payload: Record<string, unknown>,
): Promise<TelegramApiResult> {
	const botToken = requireConvexEnv("TELEGRAM_SUPPORT_BOT_TOKEN");
	const response = await fetch(
		`${TELEGRAM_API_BASE_URL}/bot${botToken}/${method}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		},
	);

	const bodyText = await response.text();
	let parsedBody: {
		description?: string;
		result?: {
			message_id?: number;
			message_thread_id?: number;
		};
	} | null = null;
	try {
		parsedBody = JSON.parse(bodyText) as {
			description?: string;
			result?: {
				message_id?: number;
				message_thread_id?: number;
			};
		};
	} catch {
		parsedBody = null;
	}

	if (!response.ok) {
		const description = parsedBody?.description ?? bodyText.trim();
		return {
			ok: false,
			status: response.status,
			error: `Telegram ${method} failed with status ${response.status}${description ? `: ${description}` : "."}`,
		};
	}

	return {
		ok: true,
		messageId: parsedBody?.result?.message_id,
		messageThreadId: parsedBody?.result?.message_thread_id,
	};
}
