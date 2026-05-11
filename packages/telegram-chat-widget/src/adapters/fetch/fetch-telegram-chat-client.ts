import {
	createTelegramChatScreenshotDescriptor,
	type TelegramChatScreenshotDescriptor,
} from "../../core/attachment-policy";
import { renderTelegramChatBugReportBody } from "../../core/bug-report-payload";
import type {
	TelegramChatClient,
	TelegramChatSendInput,
} from "../../core/telegram-chat-client";
import type {
	TelegramChatDeliveryStatus,
	TelegramChatMessage,
	TelegramChatMessageAttachment,
	TelegramChatMessageSource,
	TelegramChatThreadState,
	TelegramChatThreadStatus,
} from "../../core/telegram-chat-types";

export type FetchTelegramChatFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export type FetchTelegramChatClientOptions = {
	readonly messagesEndpoint?: string;
	readonly attachmentsEndpoint?: string;
	readonly fetchImpl?: FetchTelegramChatFetch;
};

type UploadedTelegramChatScreenshot = TelegramChatScreenshotDescriptor & {
	readonly storageId: string;
};

const defaultMessagesEndpoint = "/api/support/messages";
const defaultAttachmentsEndpoint = "/api/support/attachments";

export function createFetchTelegramChatClient(
	options: FetchTelegramChatClientOptions = {},
): TelegramChatClient {
	const fetchImpl = getFetchImplementation(options.fetchImpl);
	const messagesEndpoint = options.messagesEndpoint ?? defaultMessagesEndpoint;
	const attachmentsEndpoint =
		options.attachmentsEndpoint ?? defaultAttachmentsEndpoint;

	return {
		loadThread: () => loadTelegramChatThread({ fetchImpl, messagesEndpoint }),
		sendMessage: (input) =>
			sendTelegramChatMessage({
				input,
				fetchImpl,
				messagesEndpoint,
				attachmentsEndpoint,
			}),
	};
}

async function loadTelegramChatThread({
	fetchImpl,
	messagesEndpoint,
}: {
	readonly fetchImpl: FetchTelegramChatFetch;
	readonly messagesEndpoint: string;
}) {
	const response = await fetchImpl(messagesEndpoint, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		cache: "no-store",
	});

	return await readTelegramChatThreadResponse(response);
}

async function sendTelegramChatMessage({
	input,
	fetchImpl,
	messagesEndpoint,
	attachmentsEndpoint,
}: {
	readonly input: TelegramChatSendInput;
	readonly fetchImpl: FetchTelegramChatFetch;
	readonly messagesEndpoint: string;
	readonly attachmentsEndpoint: string;
}) {
	const messageText = getTelegramChatMessageText(input);
	if (!messageText) {
		throw new Error("Message text is required.");
	}

	const uploadedAttachment = input.attachment
		? await uploadTelegramChatScreenshot({
				file: input.attachment.file,
				fetchImpl,
				attachmentsEndpoint,
			})
		: null;

	const response = await fetchImpl(messagesEndpoint, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messageText,
			pagePath: input.pagePath,
			entrySurface: input.entrySurface,
			attachment: uploadedAttachment,
		}),
	});

	return await readTelegramChatThreadResponse(response);
}

async function uploadTelegramChatScreenshot({
	file,
	fetchImpl,
	attachmentsEndpoint,
}: {
	readonly file: File;
	readonly fetchImpl: FetchTelegramChatFetch;
	readonly attachmentsEndpoint: string;
}): Promise<UploadedTelegramChatScreenshot> {
	const screenshot = createTelegramChatScreenshotDescriptor(file);
	const uploadUrlResponse = await fetchImpl(attachmentsEndpoint, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			fileName: screenshot.fileName,
			contentType: screenshot.contentType,
			size: screenshot.size,
		}),
	});
	const uploadUrlBody = await readJsonObject(uploadUrlResponse);
	if (!uploadUrlResponse.ok) {
		throw new Error(
			readErrorMessage(uploadUrlBody, "Unable to prepare screenshot."),
		);
	}

	const uploadUrl = uploadUrlBody?.uploadUrl;
	if (typeof uploadUrl !== "string" || !uploadUrl) {
		throw new Error("Unable to prepare screenshot.");
	}

	const storageResponse = await fetchImpl(uploadUrl, {
		method: "POST",
		headers: {
			"Content-Type": screenshot.contentType,
		},
		body: file,
	});
	const storageBody = await readJsonObject(storageResponse);
	if (!storageResponse.ok) {
		throw new Error(
			readErrorMessage(storageBody, "Unable to upload screenshot."),
		);
	}

	const storageId = storageBody?.storageId;
	if (typeof storageId !== "string" || !storageId) {
		throw new Error("Unable to upload screenshot.");
	}

	return {
		...screenshot,
		storageId,
	};
}

async function readTelegramChatThreadResponse(response: Response) {
	const body = await readJsonObject(response);

	if (!response.ok) {
		throw new Error(readErrorMessage(body, "Unable to load support."));
	}

	if (!isTelegramChatThreadState(body)) {
		throw new Error("Support returned an invalid response.");
	}

	return body;
}

async function readJsonObject(response: Response) {
	const body = (await response.json().catch(() => null)) as unknown;
	return isRecord(body) ? body : null;
}

function readErrorMessage(
	body: Record<string, unknown> | null,
	fallbackMessage: string,
) {
	return typeof body?.error === "string" && body.error
		? body.error
		: fallbackMessage;
}

function getTelegramChatMessageText(input: TelegramChatSendInput) {
	switch (input.kind) {
		case "message":
			return input.messageText.trim();
		case "bug_report":
			return renderTelegramChatBugReportBody(input.bugReport);
	}
}

function getFetchImplementation(fetchImpl: FetchTelegramChatFetch | undefined) {
	if (fetchImpl) {
		return fetchImpl;
	}

	if (typeof globalThis.fetch !== "function") {
		throw new Error("A fetch implementation is required.");
	}

	return globalThis.fetch.bind(globalThis);
}

function isTelegramChatThreadState(
	value: Record<string, unknown> | null,
): value is TelegramChatThreadState {
	if (!value) {
		return false;
	}

	return (
		isTelegramChatThreadStatus(value.status) &&
		(typeof value.supportId === "string" || value.supportId === null) &&
		Array.isArray(value.messages) &&
		value.messages.every(isTelegramChatMessage) &&
		typeof value.fallbackHref === "string" &&
		(typeof value.error === "string" || value.error === null)
	);
}

function isTelegramChatMessage(value: unknown): value is TelegramChatMessage {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.id === "string" &&
		isTelegramChatMessageSource(value.source) &&
		(typeof value.body === "string" || value.body === null) &&
		isTelegramChatMessageAttachment(value.attachment) &&
		typeof value.createdAt === "number" &&
		isTelegramChatDeliveryStatus(value.deliveryStatus) &&
		(typeof value.deliveryFailureClass === "string" ||
			value.deliveryFailureClass === null)
	);
}

function isTelegramChatMessageAttachment(
	value: unknown,
): value is TelegramChatMessageAttachment | null {
	if (value === null) {
		return true;
	}

	if (!isRecord(value)) {
		return false;
	}

	return (
		value.kind === "screenshot" &&
		typeof value.fileName === "string" &&
		typeof value.contentType === "string" &&
		typeof value.size === "number" &&
		(typeof value.url === "string" || value.url === null)
	);
}

function isTelegramChatThreadStatus(
	value: unknown,
): value is TelegramChatThreadStatus {
	return (
		value === "empty" ||
		value === "open" ||
		value === "closed" ||
		value === "disabled"
	);
}

function isTelegramChatMessageSource(
	value: unknown,
): value is TelegramChatMessageSource {
	return value === "visitor" || value === "operator" || value === "system";
}

function isTelegramChatDeliveryStatus(
	value: unknown,
): value is TelegramChatDeliveryStatus {
	return (
		value === "not_required" ||
		value === "sending" ||
		value === "delivered_to_parker" ||
		value === "delivery_failed"
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
