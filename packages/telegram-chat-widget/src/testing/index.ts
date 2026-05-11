import type {
	TelegramChatMessage,
	TelegramChatThreadState,
} from "../core/telegram-chat-types";

export function createTelegramChatTestMessage(
	overrides: Partial<TelegramChatMessage> = {},
): TelegramChatMessage {
	return {
		id: "message_1",
		source: "visitor",
		body: "Can you help?",
		attachment: null,
		createdAt: 1_764_566_400_000,
		deliveryStatus: "delivered_to_parker",
		deliveryFailureClass: null,
		...overrides,
	};
}

export function createTelegramChatTestThreadState(
	overrides: Partial<TelegramChatThreadState> = {},
): TelegramChatThreadState {
	return {
		status: "open",
		supportId: "support_123",
		messages: [createTelegramChatTestMessage()],
		fallbackHref: "https://t.me/parkerrex",
		error: null,
		...overrides,
	};
}
