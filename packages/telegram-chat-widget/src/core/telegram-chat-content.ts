export type TelegramChatContent = {
	readonly launcherLabel: string;
	readonly panelTitle: string;
	readonly panelSubtitle: string;
	readonly messagePlaceholder: string;
	readonly bugReportSummaryPlaceholder: string;
	readonly bugReportStepsPlaceholder: string;
	readonly bugReportExpectedPlaceholder: string;
	readonly attachScreenshotLabel: string;
	readonly bugReportModeLabel: string;
	readonly messageModeLabel: string;
	readonly sendLabel: string;
	readonly fallbackLabel: string;
	readonly emptyStateTitle: string;
	readonly emptyStateBody: string;
	readonly disabledStateBody: string;
	readonly screenshotRejectedTypeMessage: string;
	readonly screenshotRejectedSizeMessage: string;
	readonly genericErrorMessage: string;
};

export type TelegramChatContentOverrides = Partial<TelegramChatContent>;

export const defaultTelegramChatContent = {
	launcherLabel: "Message Parker",
	panelTitle: "Ship by Sunday support",
	panelSubtitle: "Send Parker the context, screenshot, or bug details.",
	messagePlaceholder: "Ask a question or share what is stuck.",
	bugReportSummaryPlaceholder: "What happened?",
	bugReportStepsPlaceholder: "What were you doing?",
	bugReportExpectedPlaceholder: "What did you expect?",
	attachScreenshotLabel: "Attach screenshot",
	bugReportModeLabel: "Report a bug",
	messageModeLabel: "Message",
	sendLabel: "Send",
	fallbackLabel: "Open Telegram",
	emptyStateTitle: "Start a support thread",
	emptyStateBody: "Parker will see this in Telegram with your page context.",
	disabledStateBody:
		"Ship by Sunday support is using Telegram directly right now.",
	screenshotRejectedTypeMessage: "Upload a PNG, JPG, or WebP screenshot.",
	screenshotRejectedSizeMessage: "Screenshots must be 10 MB or smaller.",
	genericErrorMessage: "Unable to reach support.",
} as const satisfies TelegramChatContent;

export function mergeTelegramChatContent(
	overrides?: TelegramChatContentOverrides | null,
): TelegramChatContent {
	if (!overrides) {
		return { ...defaultTelegramChatContent };
	}

	return {
		...defaultTelegramChatContent,
		...removeUndefinedContentOverrides(overrides),
	};
}

function removeUndefinedContentOverrides(
	overrides: TelegramChatContentOverrides,
) {
	const definedOverrides: Partial<Record<keyof TelegramChatContent, string>> =
		{};
	for (const [key, value] of Object.entries(overrides) as Array<
		[keyof TelegramChatContent, string | undefined]
	>) {
		if (typeof value === "string") {
			definedOverrides[key] = value;
		}
	}

	return definedOverrides;
}
