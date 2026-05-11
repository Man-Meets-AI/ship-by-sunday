import type { ReactElement } from "react";

import type {
	TelegramChatClient,
	TelegramChatSendInput,
} from "../core/telegram-chat-client";
import type { TelegramChatContentOverrides } from "../core/telegram-chat-content";
import type {
	TelegramChatEntrySurface,
	TelegramChatPlacement,
} from "../core/telegram-chat-types";
import type { TelegramChatEventSink } from "../core/telegram-chat-events";

export type TelegramChatWidgetProps = {
	readonly client: TelegramChatClient;
	readonly entrySurface: TelegramChatEntrySurface;
	readonly placement?: TelegramChatPlacement;
	readonly content?: TelegramChatContentOverrides;
	readonly fallbackHref?: string;
	readonly eventSink?: TelegramChatEventSink;
	readonly onSend?: (input: TelegramChatSendInput) => void;
};

export function TelegramChatWidget(
	_props: TelegramChatWidgetProps,
): ReactElement | null {
	return null;
}
