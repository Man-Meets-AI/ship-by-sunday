export const SUPPORT_SCREENSHOT_MAX_BYTES = 10 * 1024 * 1024;
export const SUPPORT_SCREENSHOT_FILE_NAME_MAX_LENGTH = 120;

export const supportScreenshotContentTypes = [
	"image/png",
	"image/jpeg",
	"image/webp",
] as const;

export type SupportScreenshotContentType =
	(typeof supportScreenshotContentTypes)[number];

export function isSupportScreenshotContentType(
	value: string,
): value is SupportScreenshotContentType {
	return supportScreenshotContentTypes.includes(
		value as SupportScreenshotContentType,
	);
}

export function normalizeSupportScreenshotFileName(fileName: string) {
	const normalized = fileName
		.trim()
		.replaceAll(/[/\\]/g, "_")
		.replaceAll(/\s+/g, " ")
		.slice(0, SUPPORT_SCREENSHOT_FILE_NAME_MAX_LENGTH);

	return normalized || "screenshot.png";
}

export function formatSupportAttachmentSize(sizeBytes: number) {
	if (sizeBytes >= 1024 * 1024) {
		return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}
