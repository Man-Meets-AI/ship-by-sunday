"use client";

import { useCallback, useMemo, useState } from "react";

import {
	normalizeTelegramChatScreenshotFileName,
	validateTelegramChatScreenshotFile,
} from "../core/attachment-policy";
import {
	createTelegramChatBugReportPayload,
	renderTelegramChatBugReportBody,
} from "../core/bug-report-payload";
import type {
	TelegramChatClient,
	TelegramChatSendInput,
} from "../core/telegram-chat-client";
import type { TelegramChatContent } from "../core/telegram-chat-content";
import {
	createTelegramChatEvent,
	getTelegramChatLatestVisitorDeliveryMetadata,
	type TelegramChatEventSink,
} from "../core/telegram-chat-events";
import type {
	TelegramChatBugReportDraft,
	TelegramChatEntrySurface,
	TelegramChatMessage,
	TelegramChatMode,
	TelegramChatStatus,
	TelegramChatSurface,
	TelegramChatThreadState,
} from "../core/telegram-chat-types";

export const telegramChatPollIntervalMs = 3_000;

export function useTelegramChatController({
	client,
	content,
	entrySurface,
	eventSink,
	fallbackHref,
	onSend,
	surface,
}: {
	readonly client: TelegramChatClient;
	readonly content: TelegramChatContent;
	readonly entrySurface: TelegramChatEntrySurface;
	readonly eventSink: TelegramChatEventSink | undefined;
	readonly fallbackHref: string;
	readonly onSend: ((input: TelegramChatSendInput) => void) | undefined;
	readonly surface: TelegramChatSurface;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [draftMessage, setDraftMessage] = useState("");
	const [chatMode, setChatMode] = useState<TelegramChatMode>("message");
	const [bugReportDraft, setBugReportDraft] =
		useState<TelegramChatBugReportDraft>({
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
		useState<TelegramChatMessage | null>(null);
	const [threadState, setThreadState] = useState<TelegramChatThreadState>(
		createEmptyThreadState(fallbackHref),
	);
	const [status, setStatus] = useState<TelegramChatStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [hasLoadedThread, setHasLoadedThread] = useState(false);

	const isBusy = status === "loading" || status === "sending";
	const outgoingMessage = useMemo(
		() =>
			createOutgoingMessage({
				attachmentFile,
				bugReportDraft,
				chatMode,
				draftMessage,
				entrySurface,
			}),
		[attachmentFile, bugReportDraft, chatMode, draftMessage, entrySurface],
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
	const canSend =
		Boolean(outgoingMessage) &&
		!isBusy &&
		threadState.status !== "closed" &&
		threadState.status !== "disabled";

	const emitEvent = useCallback(
		(
			name: Parameters<typeof createTelegramChatEvent>[0],
			properties: Parameters<typeof createTelegramChatEvent>[1],
		) => {
			eventSink?.(createTelegramChatEvent(name, properties));
		},
		[eventSink],
	);

	const refreshThread = useCallback(
		async (options?: { readonly quiet?: boolean }) => {
			const quiet = options?.quiet ?? false;
			if (!quiet) {
				setStatus((currentStatus) =>
					currentStatus === "sending" ? currentStatus : "loading",
				);
			}
			try {
				const nextThreadState = await client.loadThread();
				setThreadState(nextThreadState);
				setErrorMessage(nextThreadState.error);
				setHasLoadedThread(true);
				if (!quiet) {
					setStatus("idle");
				}
			} catch (error) {
				if (!quiet) {
					const caughtError = error instanceof Error ? error : String(error);
					setErrorMessage(
						getErrorMessage(caughtError, content.genericErrorMessage),
					);
					setStatus("error");
				}
			}
		},
		[client, content.genericErrorMessage],
	);

	const applyThreadState = useCallback(
		(nextThreadState: TelegramChatThreadState) => {
			setThreadState(nextThreadState);
			setErrorMessage(nextThreadState.error);
			setHasLoadedThread(true);
			setStatus((currentStatus) =>
				currentStatus === "sending" ? currentStatus : "idle",
			);
		},
		[],
	);

	const openChat = useCallback(() => {
		setIsOpen(true);
		emitEvent("support_widget_opened", {
			surface,
			entrySurface,
			pagePath: getCurrentPagePath(),
		});
	}, [emitEvent, entrySurface, surface]);

	const closeChat = useCallback(() => {
		setIsOpen(false);
		emitEvent("support_widget_closed", {
			surface,
			entrySurface,
			pagePath: getCurrentPagePath(),
			messageCount: threadState.messages.length,
			threadStatus: threadState.status,
			...getTelegramChatLatestVisitorDeliveryMetadata(threadState),
		});
	}, [emitEvent, entrySurface, surface, threadState]);

	const sendMessage = useCallback(async () => {
		if (!outgoingMessage || !canSend) {
			return;
		}

		const currentDraftMessage = draftMessage;
		const currentBugReportDraft = bugReportDraft;
		const currentAttachmentFile = attachmentFile;
		const sendInput = outgoingMessage.sendInput;
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
			createOptimisticVisitorMessage(
				outgoingMessage.optimisticBody,
				currentAttachmentFile,
			),
		);
		onSend?.(sendInput);
		try {
			const nextThreadState = await client.sendMessage(sendInput);
			setThreadState(nextThreadState);
			setOptimisticMessage(null);
			setStatus("idle");
			emitEvent("support_widget_message_sent", {
				surface,
				entrySurface,
				pagePath: getCurrentPagePath(),
				threadStatus: nextThreadState.status,
				messageCount: nextThreadState.messages.length,
				...getTelegramChatLatestVisitorDeliveryMetadata(nextThreadState),
			});
		} catch (error) {
			const caughtError = error instanceof Error ? error : String(error);
			setErrorMessage(
				getErrorMessage(caughtError, content.genericErrorMessage),
			);
			setDraftMessage(currentDraftMessage);
			setBugReportDraft(currentBugReportDraft);
			setAttachmentFileState(currentAttachmentFile);
			setOptimisticMessage(null);
			setStatus("error");
			emitEvent("support_widget_message_failed", {
				surface,
				entrySurface,
				pagePath: getCurrentPagePath(),
				threadStatus: threadState.status,
				failureClass: getSupportFailureAnalyticsClass(caughtError),
			});
		}
	}, [
		attachmentFile,
		bugReportDraft,
		canSend,
		chatMode,
		client,
		content.genericErrorMessage,
		draftMessage,
		emitEvent,
		entrySurface,
		onSend,
		outgoingMessage,
		surface,
		threadState.status,
	]);

	const setAttachmentFile = useCallback(
		(file: File | null) => {
			if (!file) {
				setAttachmentFileState(null);
				setAttachmentErrorMessage(null);
				return;
			}

			const validation = validateTelegramChatScreenshotFile(file);
			if (!validation.ok) {
				setAttachmentErrorMessage(
					validation.reason === "unsupported_content_type"
						? content.screenshotRejectedTypeMessage
						: content.screenshotRejectedSizeMessage,
				);
				return;
			}

			setAttachmentFileState(file);
			setAttachmentErrorMessage(null);
		},
		[
			content.screenshotRejectedSizeMessage,
			content.screenshotRejectedTypeMessage,
		],
	);

	const recordFallbackClick = useCallback(() => {
		emitEvent("support_fallback_clicked", {
			surface,
			entrySurface,
			pagePath: getCurrentPagePath(),
			threadStatus: threadState.status,
			...getTelegramChatLatestVisitorDeliveryMetadata(threadState),
		});
	}, [emitEvent, entrySurface, surface, threadState]);

	return {
		attachmentErrorMessage,
		attachmentFile,
		applyThreadState,
		bugReportDraft,
		canSend,
		chatMode,
		closeChat,
		draftMessage,
		errorMessage,
		hasLoadedThread,
		isOpen,
		openChat,
		recordFallbackClick,
		refreshThread,
		sendMessage,
		setAttachmentFile,
		setBugReportDraft,
		setChatMode,
		setDraftMessage,
		status,
		threadState: displayedThreadState,
	};
}

function createOutgoingMessage({
	attachmentFile,
	bugReportDraft,
	chatMode,
	draftMessage,
	entrySurface,
}: {
	readonly attachmentFile: File | null;
	readonly bugReportDraft: TelegramChatBugReportDraft;
	readonly chatMode: TelegramChatMode;
	readonly draftMessage: string;
	readonly entrySurface: TelegramChatEntrySurface;
}): {
	readonly optimisticBody: string;
	readonly sendInput: TelegramChatSendInput;
} | null {
	const pagePath = getSafeCurrentPagePath();
	const attachment = attachmentFile
		? { kind: "screenshot" as const, file: attachmentFile }
		: null;

	if (chatMode === "message") {
		const messageText = draftMessage.trim();
		return messageText
			? {
					optimisticBody: messageText,
					sendInput: {
						kind: "message",
						messageText,
						pagePath,
						entrySurface,
						attachment,
					},
				}
			: null;
	}

	const bugReport = createTelegramChatBugReportPayload({
		draft: bugReportDraft,
		pageContext: {
			pagePath,
			viewport: getSafeViewportLabel(),
			userAgent: getSafeUserAgentLabel(),
		},
	});
	if (!bugReport) {
		return null;
	}

	return {
		optimisticBody: renderTelegramChatBugReportBody(bugReport),
		sendInput: {
			kind: "bug_report",
			bugReport,
			pagePath,
			entrySurface,
			attachment,
		},
	};
}

function createOptimisticVisitorMessage(
	messageText: string,
	attachmentFile: File | null,
): TelegramChatMessage {
	return {
		id: `optimistic-${Date.now()}`,
		source: "visitor",
		body: messageText,
		attachment: attachmentFile
			? {
					kind: "screenshot",
					fileName: normalizeTelegramChatScreenshotFileName(
						attachmentFile.name,
					),
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

function createEmptyThreadState(fallbackHref: string): TelegramChatThreadState {
	return {
		status: "empty",
		supportId: null,
		messages: [],
		fallbackHref,
		error: null,
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

function getErrorMessage(error: Error | string, fallbackMessage: string) {
	return error instanceof Error && error.message
		? error.message
		: typeof error === "string" && error
			? error
			: fallbackMessage;
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
