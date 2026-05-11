import type {
	TelegramChatDeliveryStatus,
	TelegramChatThreadState,
} from "./telegram-chat-types";

export type TelegramChatEventName =
	| "support_widget_opened"
	| "support_widget_closed"
	| "support_widget_message_sent"
	| "support_widget_message_failed"
	| "support_fallback_clicked";

export type TelegramChatEventMetadataValue = string | number | boolean | null;

export type TelegramChatEventMetadata = Record<
	string,
	TelegramChatEventMetadataValue
>;

export type TelegramChatEvent = {
	readonly name: TelegramChatEventName;
	readonly properties: TelegramChatEventMetadata;
};

export type TelegramChatEventSink = (event: TelegramChatEvent) => void;

const allowedEventPropertyNames = new Set([
	"entrySurface",
	"failureClass",
	"latestDeliveryFailureClass",
	"latestDeliveryStatus",
	"messageCount",
	"pagePath",
	"surface",
	"threadStatus",
]);

export function createTelegramChatEvent(
	name: TelegramChatEventName,
	properties: TelegramChatEventMetadata,
): TelegramChatEvent {
	return {
		name,
		properties: validateTelegramChatEventMetadata(properties),
	};
}

export function getTelegramChatLatestVisitorDeliveryMetadata(
	threadState: TelegramChatThreadState,
): {
	readonly latestDeliveryStatus: TelegramChatDeliveryStatus | null;
	readonly latestDeliveryFailureClass: string | null;
} {
	const latestVisitorMessage = [...threadState.messages]
		.reverse()
		.find((message) => message.source === "visitor");

	return {
		latestDeliveryStatus: latestVisitorMessage?.deliveryStatus ?? null,
		latestDeliveryFailureClass:
			latestVisitorMessage?.deliveryFailureClass ?? null,
	};
}

function validateTelegramChatEventMetadata(
	properties: TelegramChatEventMetadata,
) {
	const validatedProperties: TelegramChatEventMetadata = {};
	for (const [key, value] of Object.entries(properties)) {
		if (!allowedEventPropertyNames.has(key)) {
			throw new Error(`Support analytics property "${key}" is not metadata.`);
		}

		if (
			typeof value !== "string" &&
			typeof value !== "number" &&
			typeof value !== "boolean" &&
			value !== null
		) {
			throw new Error(`Support analytics property "${key}" is not metadata.`);
		}

		validatedProperties[key] = value;
	}

	return validatedProperties;
}
