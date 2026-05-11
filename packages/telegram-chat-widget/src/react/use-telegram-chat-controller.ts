"use client";

import { useCallback, useMemo, useRef, useState } from "react";

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

type TelegramChatPendingVisitorMessage = {
	readonly body: string;
	readonly attachment: TelegramChatMessage["attachment"];
	readonly existingMessageIds: ReadonlySet<string>;
};

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
	const pendingVisitorMessageRef =
		useRef<TelegramChatPendingVisitorMessage | null>(null);
	const realtimeSettledPendingSendRef = useRef(false);

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
			const matchingPendingMessage = pendingVisitorMessageRef.current
				? findMatchingVisitorMessage(
						nextThreadState,
						pendingVisitorMessageRef.current,
					)
				: null;
			if (matchingPendingMessage) {
				setOptimisticMessage(null);
			}
			if (
				matchingPendingMessage &&
				matchingPendingMessage.deliveryStatus !== "sending"
			) {
				pendingVisitorMessageRef.current = null;
				realtimeSettledPendingSendRef.current = true;
			}

			setThreadState(nextThreadState);
			setErrorMessage(nextThreadState.error);
			setHasLoadedThread(true);
			setStatus((currentStatus) => {
				if (currentStatus !== "sending") {
					return "idle";
				}

				return matchingPendingMessage &&
					matchingPendingMessage.deliveryStatus !== "sending"
					? "idle"
					: currentStatus;
			});
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
		const pendingVisitorMessage = createPendingVisitorMessage(
			outgoingMessage.optimisticBody,
			currentAttachmentFile,
			threadState.messages,
		);
		pendingVisitorMessageRef.current = pendingVisitorMessage;
		realtimeSettledPendingSendRef.current = false;
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
		setOptimisticMessage(createOptimisticVisitorMessage(pendingVisitorMessage));
		onSend?.(sendInput);
		try {
			const nextThreadState = await client.sendMessage(sendInput);
			pendingVisitorMessageRef.current = null;
			realtimeSettledPendingSendRef.current = false;
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
			if (realtimeSettledPendingSendRef.current) {
				realtimeSettledPendingSendRef.current = false;
				setOptimisticMessage(null);
				setStatus("idle");
				return;
			}

			pendingVisitorMessageRef.current = null;
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
		threadState.messages,
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

function createPendingVisitorMessage(
	messageText: string,
	attachmentFile: File | null,
	existingMessages: readonly TelegramChatMessage[],
): TelegramChatPendingVisitorMessage {
	return {
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
		existingMessageIds: new Set(existingMessages.map((message) => message.id)),
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

function createOptimisticVisitorMessage({
	body,
	attachment,
}: TelegramChatPendingVisitorMessage): TelegramChatMessage {
	return {
		id: `optimistic-${Date.now()}`,
		source: "visitor",
		body,
		attachment,
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

function findMatchingVisitorMessage(
	threadState: TelegramChatThreadState,
	pendingMessage: TelegramChatPendingVisitorMessage,
) {
	for (let index = threadState.messages.length - 1; index >= 0; index -= 1) {
		const message = threadState.messages[index];
		if (
			message.source === "visitor" &&
			!pendingMessage.existingMessageIds.has(message.id) &&
			message.body === pendingMessage.body &&
			telegramChatAttachmentsMatch(
				message.attachment,
				pendingMessage.attachment,
			)
		) {
			return message;
		}
	}

	return null;
}

function telegramChatAttachmentsMatch(
	messageAttachment: TelegramChatMessage["attachment"],
	pendingAttachment: TelegramChatPendingVisitorMessage["attachment"],
) {
	if (!messageAttachment || !pendingAttachment) {
		return messageAttachment === pendingAttachment;
	}

	return (
		messageAttachment.kind === pendingAttachment.kind &&
		messageAttachment.fileName === pendingAttachment.fileName &&
		messageAttachment.contentType === pendingAttachment.contentType &&
		messageAttachment.size === pendingAttachment.size
	);
}
