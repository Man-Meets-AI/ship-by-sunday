"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import {
	loadSupportThread,
	sendSupportMessage,
	type SupportThreadState,
	type SupportWidgetEntrySurface,
} from "./support-api-client";

export type SupportWidgetAnalyticsSurface = "homepage" | "workspace";
type SupportChatStatus = "idle" | "loading" | "sending" | "error";

const emptyThreadState = (fallbackHref: string): SupportThreadState => ({
	status: "empty",
	supportId: null,
	messages: [],
	fallbackHref,
	error: null,
});

export function useSupportChat({
	analyticsSurface,
	entrySurface,
	fallbackHref,
}: {
	readonly analyticsSurface: SupportWidgetAnalyticsSurface;
	readonly entrySurface: SupportWidgetEntrySurface;
	readonly fallbackHref: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [draftMessage, setDraftMessage] = useState("");
	const [threadState, setThreadState] = useState<SupportThreadState>(
		emptyThreadState(fallbackHref),
	);
	const [status, setStatus] = useState<SupportChatStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [hasLoadedThread, setHasLoadedThread] = useState(false);

	const isBusy = status === "loading" || status === "sending";
	const canSend = useMemo(
		() =>
			draftMessage.trim().length > 0 &&
			!isBusy &&
			threadState.status !== "closed" &&
			threadState.status !== "disabled",
		[draftMessage, isBusy, threadState.status],
	);

	const refreshThread = useCallback(async () => {
		setStatus((currentStatus) =>
			currentStatus === "sending" ? currentStatus : "loading",
		);
		try {
			const nextThreadState = await loadSupportThread();
			setThreadState(nextThreadState);
			setErrorMessage(nextThreadState.error);
			setHasLoadedThread(true);
			setStatus("idle");
		} catch (error) {
			setErrorMessage(getErrorMessage(error));
			setStatus("error");
		}
	}, []);

	const openChat = useCallback(() => {
		setIsOpen(true);
		capturePostHogProductEvent({
			event: "support_widget_opened",
			properties: {
				surface: analyticsSurface,
				entrySurface,
				pagePath: getCurrentPagePath(),
			},
		});
	}, [analyticsSurface, entrySurface]);

	const closeChat = useCallback(() => {
		setIsOpen(false);
		capturePostHogProductEvent({
			event: "support_widget_closed",
			properties: {
				surface: analyticsSurface,
				entrySurface,
				pagePath: getCurrentPagePath(),
				messageCount: threadState.messages.length,
				threadStatus: threadState.status,
				...getLatestVisitorDeliveryMetadata(threadState),
			},
		});
	}, [analyticsSurface, entrySurface, threadState]);

	const sendMessage = useCallback(async () => {
		const messageText = draftMessage.trim();
		if (!messageText || !canSend) {
			return;
		}

		setStatus("sending");
		setErrorMessage(null);
		try {
			const nextThreadState = await sendSupportMessage({
				messageText,
				pagePath: window.location.pathname,
				entrySurface,
			});
			setThreadState(nextThreadState);
			setDraftMessage("");
			setStatus("idle");
			capturePostHogProductEvent({
				event: "support_widget_message_sent",
				properties: {
					surface: analyticsSurface,
					entrySurface,
					pagePath: getCurrentPagePath(),
					threadStatus: nextThreadState.status,
					messageCount: nextThreadState.messages.length,
					...getLatestVisitorDeliveryMetadata(nextThreadState),
				},
			});
		} catch (error) {
			const nextErrorMessage = getErrorMessage(error);
			setErrorMessage(nextErrorMessage);
			setStatus("error");
			capturePostHogProductEvent({
				event: "support_widget_message_failed",
				properties: {
					surface: analyticsSurface,
					entrySurface,
					pagePath: getCurrentPagePath(),
					threadStatus: threadState.status,
					failureClass: getSupportFailureAnalyticsClass(error),
				},
			});
		}
	}, [
		analyticsSurface,
		canSend,
		draftMessage,
		entrySurface,
		threadState.status,
	]);

	const recordFallbackClick = useCallback(() => {
		capturePostHogProductEvent({
			event: "support_fallback_clicked",
			properties: {
				surface: analyticsSurface,
				entrySurface,
				pagePath: getCurrentPagePath(),
				threadStatus: threadState.status,
				...getLatestVisitorDeliveryMetadata(threadState),
			},
		});
	}, [analyticsSurface, entrySurface, threadState]);

	useEffect(() => {
		if (!isOpen || hasLoadedThread) {
			return;
		}

		void refreshThread();
	}, [hasLoadedThread, isOpen, refreshThread]);

	useEffect(() => {
		if (!isOpen || !hasLoadedThread) {
			return;
		}

		const intervalId = window.setInterval(() => {
			void refreshThread();
		}, 15_000);

		return () => window.clearInterval(intervalId);
	}, [hasLoadedThread, isOpen, refreshThread]);

	return {
		canSend,
		closeChat,
		draftMessage,
		errorMessage,
		isBusy,
		isOpen,
		openChat,
		recordFallbackClick,
		refreshThread,
		sendMessage,
		setDraftMessage,
		status,
		threadState,
	};
}

function getErrorMessage(error: unknown) {
	return error instanceof Error && error.message
		? error.message
		: "Unable to reach support.";
}

function getCurrentPagePath() {
	return window.location.pathname.slice(0, 256) || "/";
}

function getLatestVisitorDeliveryMetadata(threadState: SupportThreadState) {
	const latestVisitorMessage = [...threadState.messages]
		.reverse()
		.find((message) => message.source === "visitor");

	return {
		latestDeliveryStatus: latestVisitorMessage?.deliveryStatus ?? null,
		latestDeliveryFailureClass:
			latestVisitorMessage?.deliveryFailureClass ?? null,
	};
}

function getSupportFailureAnalyticsClass(error: unknown) {
	const message = error instanceof Error ? error.message.toLowerCase() : "";
	if (message.includes("closed")) {
		return "thread_closed";
	}
	if (
		message.includes("wait") ||
		message.includes("busy") ||
		message.includes("parker has your messages")
	) {
		return "rate_limited";
	}
	if (message.includes("required") || message.includes("characters")) {
		return "validation";
	}

	return "request_failed";
}
