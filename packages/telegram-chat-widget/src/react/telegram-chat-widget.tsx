"use client";

import { useEffect, useMemo, type ReactElement } from "react";

import type {
	TelegramChatClient,
	TelegramChatRealtimeState,
	TelegramChatSendInput,
} from "../core/telegram-chat-client";
import {
	type TelegramChatContentOverrides,
	mergeTelegramChatContent,
} from "../core/telegram-chat-content";
import type { TelegramChatEventSink } from "../core/telegram-chat-events";
import type {
	TelegramChatEntrySurface,
	TelegramChatLauncherMotion,
	TelegramChatPlacement,
	TelegramChatSurface,
} from "../core/telegram-chat-types";
import { joinClassNames } from "./react-utils";
import { TelegramChatLauncher } from "./telegram-chat-launcher";
import { TelegramChatPanel } from "./telegram-chat-panel";
import {
	telegramChatPollIntervalMs,
	useTelegramChatController,
} from "./use-telegram-chat-controller";

export type TelegramChatWidgetProps = {
	readonly client: TelegramChatClient;
	readonly entrySurface: TelegramChatEntrySurface;
	readonly surface: TelegramChatSurface;
	readonly placement?: TelegramChatPlacement;
	readonly launcherMotion?: TelegramChatLauncherMotion;
	readonly content?: TelegramChatContentOverrides;
	readonly fallbackHref: string;
	readonly eventSink?: TelegramChatEventSink;
	readonly onSend?: (input: TelegramChatSendInput) => void;
	readonly realtime?: TelegramChatRealtimeState;
};

export function TelegramChatWidget({
	client,
	content: contentOverrides,
	entrySurface,
	eventSink,
	fallbackHref,
	launcherMotion = "standard",
	onSend,
	placement = "bottom-right",
	realtime,
	surface,
}: TelegramChatWidgetProps): ReactElement {
	const content = useMemo(
		() => mergeTelegramChatContent(contentOverrides),
		[contentOverrides],
	);
	const chatController = useTelegramChatController({
		client,
		content,
		entrySurface,
		eventSink,
		fallbackHref,
		onSend,
		surface,
	});
	const { applyThreadState, hasLoadedThread, isOpen, refreshThread } =
		chatController;

	useEffect(() => {
		if (realtime?.status !== "ready") {
			return;
		}

		applyThreadState(realtime.threadState);
	}, [applyThreadState, realtime]);

	useEffect(() => {
		if (
			!isOpen ||
			hasLoadedThread ||
			telegramChatRealtimeSuppressesFetchRefresh(realtime)
		) {
			return;
		}

		void refreshThread();
	}, [hasLoadedThread, isOpen, realtime, refreshThread]);

	useEffect(() => {
		if (
			!shouldPollTelegramChatThread({
				hasLoadedThread,
				isOpen,
				realtime,
			})
		) {
			return;
		}

		const intervalId = window.setInterval(() => {
			void refreshThread({ quiet: true });
		}, telegramChatPollIntervalMs);

		return () => window.clearInterval(intervalId);
	}, [hasLoadedThread, isOpen, realtime, refreshThread]);

	return (
		<div
			className={joinClassNames(
				"sbs-telegram-chat-widget",
				chatController.isOpen
					? "sbs-telegram-chat-widget--open"
					: "sbs-telegram-chat-widget--closed",
			)}
			data-placement={placement}
		>
			{chatController.isOpen ? (
				<TelegramChatPanel
					attachmentErrorMessage={chatController.attachmentErrorMessage}
					attachmentFile={chatController.attachmentFile}
					bugReportDraft={chatController.bugReportDraft}
					canSend={chatController.canSend}
					chatMode={chatController.chatMode}
					content={content}
					draftMessage={chatController.draftMessage}
					errorMessage={chatController.errorMessage}
					fallbackHref={fallbackHref}
					onClose={chatController.closeChat}
					onDraftMessageChange={chatController.setDraftMessage}
					onFallbackClick={chatController.recordFallbackClick}
					onSend={chatController.sendMessage}
					onSetAttachmentFile={chatController.setAttachmentFile}
					onSetBugReportDraft={chatController.setBugReportDraft}
					onSetChatMode={chatController.setChatMode}
					status={chatController.status}
					threadState={chatController.threadState}
				/>
			) : (
				<TelegramChatLauncher
					content={content}
					launcherMotion={launcherMotion}
					onOpen={chatController.openChat}
				/>
			)}
		</div>
	);
}

export function shouldPollTelegramChatThread({
	hasLoadedThread,
	isOpen,
	realtime,
}: {
	readonly hasLoadedThread: boolean;
	readonly isOpen: boolean;
	readonly realtime: TelegramChatRealtimeState | undefined;
}) {
	return (
		isOpen &&
		hasLoadedThread &&
		!telegramChatRealtimeSuppressesFetchRefresh(realtime)
	);
}

export function telegramChatRealtimeSuppressesFetchRefresh(
	realtime: TelegramChatRealtimeState | undefined,
) {
	return realtime?.status === "loading" || realtime?.status === "ready";
}
