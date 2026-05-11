"use client";

import { MessageCircle } from "lucide-react";

import type { TelegramChatContent } from "../core/telegram-chat-content";
import type { TelegramChatLauncherMotion } from "../core/telegram-chat-types";
import { joinClassNames } from "./react-utils";

export function TelegramChatLauncher({
	content,
	launcherMotion,
	onOpen,
}: {
	readonly content: TelegramChatContent;
	readonly launcherMotion: TelegramChatLauncherMotion;
	readonly onOpen: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onOpen}
			className={joinClassNames(
				"sbs-telegram-chat-launcher",
				launcherMotion === "squishy" && "sbs-telegram-chat-launcher--squishy",
			)}
		>
			<MessageCircle className="sbs-telegram-chat-icon" aria-hidden="true" />
			<span>{content.launcherLabel}</span>
		</button>
	);
}
