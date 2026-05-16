import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const widgetCss = readFileSync(
	new URL("../src/styles/telegram-chat-widget.css", import.meta.url),
	"utf8",
);

describe("telegram chat widget styles", () => {
	it("uses host-compatible T3 Code semantic token fallbacks", () => {
		for (const token of [
			"--background",
			"--foreground",
			"--card",
			"--popover",
			"--border",
			"--input",
			"--primary",
			"--primary-foreground",
			"--muted",
			"--muted-foreground",
			"--destructive",
			"--ring",
			"--radius",
		]) {
			expect(widgetCss).toContain(`var(${token}`);
		}

		expect(widgetCss).toContain('data-theme="dark"');
		expect(widgetCss).toContain("prefers-color-scheme: dark");
		expect(widgetCss).toContain("oklch(0.488 0.217 264)");
	});

	it("does not keep the old hardcoded dark-only shell colors", () => {
		for (const oldShellColor of [
			"#111418",
			"#1a1f25",
			"#1b1b1b",
			"#2a2a2a",
			"#303030",
			"#d8ff76",
		]) {
			expect(widgetCss).not.toContain(oldShellColor);
		}
	});

	it("does not style stored system acknowledgements as visible transcript clutter", () => {
		expect(widgetCss).not.toContain(".sbs-telegram-chat-message-row--system");
		expect(widgetCss).not.toContain(
			".sbs-telegram-chat-message-bubble--system",
		);
		expect(widgetCss).not.toContain(".sbs-telegram-chat-system-message");
	});
});
