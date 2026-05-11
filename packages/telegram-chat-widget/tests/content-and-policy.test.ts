import {
	TELEGRAM_CHAT_SCREENSHOT_MAX_BYTES,
	defaultTelegramChatContent,
	formatTelegramChatAttachmentSize,
	isTelegramChatScreenshotContentType,
	mergeTelegramChatContent,
	normalizeTelegramChatScreenshotFileName,
	validateTelegramChatScreenshotFile,
} from "../src/index";
import { describe, expect, it } from "vitest";

describe("telegram chat content", () => {
	it("merges partial branded content overrides without requiring every label", () => {
		const content = mergeTelegramChatContent({
			panelTitle: "Talk to support",
			messagePlaceholder: undefined,
		});

		expect(content.panelTitle).toBe("Talk to support");
		expect(content.launcherLabel).toBe(
			defaultTelegramChatContent.launcherLabel,
		);
		expect(content.messagePlaceholder).toBe(
			defaultTelegramChatContent.messagePlaceholder,
		);
	});
});

describe("telegram chat screenshot policy", () => {
	it("accepts the supported screenshot formats and normalizes file names", () => {
		expect(isTelegramChatScreenshotContentType("image/png")).toBe(true);
		expect(isTelegramChatScreenshotContentType("image/jpeg")).toBe(true);
		expect(isTelegramChatScreenshotContentType("image/webp")).toBe(true);
		expect(normalizeTelegramChatScreenshotFileName(" bugs / cart.png ")).toBe(
			"bugs _ cart.png",
		);

		expect(
			validateTelegramChatScreenshotFile({
				name: "checkout.webp",
				type: "image/webp",
				size: 1024,
			}),
		).toEqual({
			ok: true,
			screenshot: {
				kind: "screenshot",
				fileName: "checkout.webp",
				contentType: "image/webp",
				size: 1024,
			},
		});
	});

	it("rejects unsupported screenshots and files larger than 10 MB", () => {
		expect(
			validateTelegramChatScreenshotFile({
				name: "clip.mov",
				type: "video/quicktime",
				size: 1024,
			}),
		).toEqual({
			ok: false,
			reason: "unsupported_content_type",
			message: "Upload a PNG, JPG, or WebP screenshot.",
		});

		expect(
			validateTelegramChatScreenshotFile({
				name: "huge.png",
				type: "image/png",
				size: TELEGRAM_CHAT_SCREENSHOT_MAX_BYTES + 1,
			}),
		).toEqual({
			ok: false,
			reason: "invalid_size",
			message: "Screenshots must be 10 MB or smaller.",
		});
	});

	it("formats attachment sizes for compact UI labels", () => {
		expect(formatTelegramChatAttachmentSize(400)).toBe("1 KB");
		expect(formatTelegramChatAttachmentSize(2048)).toBe("2 KB");
		expect(formatTelegramChatAttachmentSize(1024 * 1024)).toBe("1.0 MB");
	});
});
