"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import {
	isSupportScreenshotContentType,
	normalizeSupportScreenshotFileName,
	SUPPORT_SCREENSHOT_MAX_BYTES,
} from "@/lib/support/support-attachment-policy";
import {
	loadSupportThread,
	sendSupportMessage,
	type SupportMessage,
	type SupportThreadState,
	type SupportWidgetEntrySurface,
} from "./support-api-client";

export type SupportWidgetAnalyticsSurface = "homepage" | "workspace";
type SupportChatStatus = "idle" | "loading" | "sending" | "error";
export type SupportChatMode = "message" | "bug_report";
export type SupportBugImpact = "blocked" | "not_blocked" | "question";
export type SupportBugReportDraft = {
	readonly summary: string;
	readonly steps: string;
	readonly expected: string;
	readonly impact: SupportBugImpact;
};

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
	const [chatMode, setChatMode] = useState<SupportChatMode>("message");
	const [bugReportDraft, setBugReportDraft] = useState<SupportBugReportDraft>({
		summary: "",
		steps: "",
		expected: "",
		impact: "blocked",
	});
	const [attachmentFile, setAttachmentFileState] = useState<File | null>(null);
	const [attachmentErrorMessage, setAttachmentErrorMessage] = useState<
		string | null
	>(null);
	const [optimisticMessage, setOptimisticMessage] =
		useState<SupportMessage | null>(null);
	const [threadState, setThreadState] = useState<SupportThreadState>(
		emptyThreadState(fallbackHref),
	);
	const [status, setStatus] = useState<SupportChatStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [hasLoadedThread, setHasLoadedThread] = useState(false);

	const isBusy = status === "loading" || status === "sending";
	const outgoingMessageText = useMemo(
		() =>
			chatMode === "bug_report"
				? buildBugReportMessageText(bugReportDraft)
				: draftMessage.trim(),
		[bugReportDraft, chatMode, draftMessage],
	);
	const displayedThreadState = useMemo(
		() =>
			optimisticMessage
				? {
						...threadState,
						messages: [...threadState.messages, optimisticMessage],
					}
				: threadState,
		[optimisticMessage, threadState],
	);
	const canSend = useMemo(
		() =>
			outgoingMessageText.length > 0 &&
			!isBusy &&
			threadState.status !== "closed" &&
			threadState.status !== "disabled",
		[outgoingMessageText, isBusy, threadState.status],
	);

	const refreshThread = useCallback(async (options?: { quiet?: boolean }) => {
		const quiet = options?.quiet ?? false;
		if (!quiet) {
			setStatus((currentStatus) =>
				currentStatus === "sending" ? currentStatus : "loading",
			);
		}
		try {
			const nextThreadState = await loadSupportThread();
			setThreadState(nextThreadState);
			setErrorMessage(nextThreadState.error);
			setHasLoadedThread(true);
			if (!quiet) {
				setStatus("idle");
			}
		} catch (error) {
			if (!quiet) {
				setErrorMessage(
					getErrorMessage(error instanceof Error ? error : String(error)),
				);
				setStatus("error");
			}
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
		const messageText = outgoingMessageText;
		if (!messageText || !canSend) {
			return;
		}

		const currentDraftMessage = draftMessage;
		const currentBugReportDraft = bugReportDraft;
		const currentAttachmentFile = attachmentFile;
		setStatus("sending");
		setErrorMessage(null);
		setDraftMessage("");
		setAttachmentFileState(null);
		setAttachmentErrorMessage(null);
		if (chatMode === "bug_report") {
			setBugReportDraft({
				summary: "",
				steps: "",
				expected: "",
				impact: "blocked",
			});
			setChatMode("message");
		}
		setOptimisticMessage(
			createOptimisticVisitorMessage(messageText, currentAttachmentFile),
		);
		try {
			const nextThreadState = await sendSupportMessage({
				messageText,
				pagePath: window.location.pathname,
				entrySurface,
				attachment: currentAttachmentFile
					? { kind: "screenshot", file: currentAttachmentFile }
					: null,
			});
			setThreadState(nextThreadState);
			setOptimisticMessage(null);
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
			const caughtError = error instanceof Error ? error : String(error);
			const nextErrorMessage = getErrorMessage(caughtError);
			setErrorMessage(nextErrorMessage);
			setDraftMessage(currentDraftMessage);
			setBugReportDraft(currentBugReportDraft);
			setAttachmentFileState(currentAttachmentFile);
			setOptimisticMessage(null);
			setStatus("error");
			capturePostHogProductEvent({
				event: "support_widget_message_failed",
				properties: {
					surface: analyticsSurface,
					entrySurface,
					pagePath: getCurrentPagePath(),
					threadStatus: threadState.status,
					failureClass: getSupportFailureAnalyticsClass(caughtError),
				},
			});
		}
	}, [
		analyticsSurface,
		attachmentFile,
		bugReportDraft,
		canSend,
		chatMode,
		draftMessage,
		entrySurface,
		outgoingMessageText,
		threadState.status,
	]);

	const setAttachmentFile = useCallback((file: File | null) => {
		if (!file) {
			setAttachmentFileState(null);
			setAttachmentErrorMessage(null);
			return;
		}

		if (!isSupportScreenshotContentType(file.type)) {
			setAttachmentErrorMessage("Upload a PNG, JPG, or WebP screenshot.");
			return;
		}

		if (file.size <= 0 || file.size > SUPPORT_SCREENSHOT_MAX_BYTES) {
			setAttachmentErrorMessage("Screenshots must be 10 MB or smaller.");
			return;
		}

		setAttachmentFileState(file);
		setAttachmentErrorMessage(null);
	}, []);

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
			void refreshThread({ quiet: true });
		}, 3_000);

		return () => window.clearInterval(intervalId);
	}, [hasLoadedThread, isOpen, refreshThread]);

	return {
		attachmentErrorMessage,
		attachmentFile,
		bugReportDraft,
		canSend,
		chatMode,
		closeChat,
		draftMessage,
		errorMessage,
		isOpen,
		openChat,
		recordFallbackClick,
		sendMessage,
		setAttachmentFile,
		setBugReportDraft,
		setChatMode,
		setDraftMessage,
		status,
		threadState: displayedThreadState,
	};
}

function getErrorMessage(error: Error | string) {
	return error instanceof Error && error.message
		? error.message
		: "Unable to reach support.";
}

function buildBugReportMessageText(bugReportDraft: SupportBugReportDraft) {
	const summary = bugReportDraft.summary.trim();
	if (!summary) {
		return "";
	}

	return [
		"Bug report",
		`Impact: ${formatBugImpact(bugReportDraft.impact)}`,
		`Page: ${getSafeCurrentPagePath()}`,
		`Viewport: ${getSafeViewportLabel()}`,
		`Browser: ${getSafeUserAgentLabel()}`,
		"",
		`What happened: ${summary}`,
		formatOptionalBugLine("What I was doing", bugReportDraft.steps),
		formatOptionalBugLine("Expected", bugReportDraft.expected),
	]
		.filter((line): line is string => typeof line === "string")
		.join("\n")
		.slice(0, 2_000);
}

function formatBugImpact(impact: SupportBugImpact) {
	switch (impact) {
		case "blocked":
			return "Blocking me";
		case "not_blocked":
			return "Not blocked";
		case "question":
			return "Not sure if this is a bug";
	}
}

function formatOptionalBugLine(label: string, value: string) {
	const normalized = value.trim();
	return normalized ? `${label}: ${normalized}` : null;
}

function createOptimisticVisitorMessage(
	messageText: string,
	attachmentFile: File | null,
): SupportMessage {
	return {
		id: `optimistic-${Date.now()}`,
		source: "visitor",
		body: messageText,
		attachment: attachmentFile
			? {
					kind: "screenshot",
					fileName: normalizeSupportScreenshotFileName(attachmentFile.name),
					contentType: attachmentFile.type,
					size: attachmentFile.size,
					url: null,
				}
			: null,
		createdAt: Date.now(),
		deliveryStatus: "sending",
		deliveryFailureClass: null,
	};
}

function getCurrentPagePath() {
	return window.location.pathname.slice(0, 256) || "/";
}

function getSafeCurrentPagePath() {
	if (typeof window === "undefined") {
		return "/";
	}

	return getCurrentPagePath();
}

function getSafeViewportLabel() {
	if (typeof window === "undefined") {
		return "unknown";
	}

	return `${window.innerWidth}x${window.innerHeight}`;
}

function getSafeUserAgentLabel() {
	if (typeof window === "undefined") {
		return "unknown";
	}

	return window.navigator.userAgent.slice(0, 160);
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

function getSupportFailureAnalyticsClass(error: Error | string) {
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
