export const TELEGRAM_CHAT_SCREENSHOT_MAX_BYTES = 10 * 1024 * 1024;
export const TELEGRAM_CHAT_SCREENSHOT_FILE_NAME_MAX_LENGTH = 120;

export const telegramChatScreenshotContentTypes = [
	"image/png",
	"image/jpeg",
	"image/webp",
] as const;

export type TelegramChatScreenshotContentType =
	(typeof telegramChatScreenshotContentTypes)[number];

export type TelegramChatScreenshotFile = {
	readonly name: string;
	readonly type: string;
	readonly size: number;
};

export type TelegramChatScreenshotDescriptor = {
	readonly kind: "screenshot";
	readonly fileName: string;
	readonly contentType: TelegramChatScreenshotContentType;
	readonly size: number;
};

export type TelegramChatScreenshotValidationResult =
	| {
			readonly ok: true;
			readonly screenshot: TelegramChatScreenshotDescriptor;
	  }
	| {
			readonly ok: false;
			readonly reason: "unsupported_content_type" | "invalid_size";
			readonly message: string;
	  };

export function isTelegramChatScreenshotContentType(
	value: string,
): value is TelegramChatScreenshotContentType {
	return telegramChatScreenshotContentTypes.includes(
		value as TelegramChatScreenshotContentType,
	);
}

export function normalizeTelegramChatScreenshotFileName(fileName: string) {
	const normalized = fileName
		.trim()
		.replaceAll(/[/\\]/g, "_")
		.replaceAll(/\s+/g, " ")
		.slice(0, TELEGRAM_CHAT_SCREENSHOT_FILE_NAME_MAX_LENGTH);

	return normalized || "screenshot.png";
}

export function validateTelegramChatScreenshotFile(
	file: TelegramChatScreenshotFile,
): TelegramChatScreenshotValidationResult {
	if (!isTelegramChatScreenshotContentType(file.type)) {
		return {
			ok: false,
			reason: "unsupported_content_type",
			message: "Upload a PNG, JPG, or WebP screenshot.",
		};
	}

	if (
		!Number.isSafeInteger(file.size) ||
		file.size <= 0 ||
		file.size > TELEGRAM_CHAT_SCREENSHOT_MAX_BYTES
	) {
		return {
			ok: false,
			reason: "invalid_size",
			message: "Screenshots must be 10 MB or smaller.",
		};
	}

	return {
		ok: true,
		screenshot: {
			kind: "screenshot",
			fileName: normalizeTelegramChatScreenshotFileName(file.name),
			contentType: file.type,
			size: file.size,
		},
	};
}

export function createTelegramChatScreenshotDescriptor(
	file: TelegramChatScreenshotFile,
) {
	const validation = validateTelegramChatScreenshotFile(file);
	if (!validation.ok) {
		throw new Error(validation.message);
	}

	return validation.screenshot;
}

export function formatTelegramChatAttachmentSize(sizeBytes: number) {
	if (sizeBytes >= 1024 * 1024) {
		return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}
