export type TelegramChatContent = {
	readonly launcherLabel: string;
	readonly panelTitle: string;
	readonly panelSubtitle: string;
	readonly starterMessage: string;
	readonly messagePlaceholder: string;
	readonly bugReportLabel: string;
	readonly bugSummaryPlaceholder: string;
	readonly bugStepsPlaceholder: string;
	readonly bugExpectedPlaceholder: string;
	readonly bugImpactLabel: string;
	readonly attachScreenshotLabel: string;
	readonly removeAttachmentLabel: string;
	readonly sendLabel: string;
	readonly closeLabel: string;
	readonly fallbackLabel: string;
	readonly directTelegramLabel: string;
	readonly loadingLabel: string;
	readonly sendingLabel: string;
	readonly deliveredLabel: string;
	readonly failedLabel: string;
	readonly closedLabel: string;
	readonly screenshotRejectedTypeMessage: string;
	readonly screenshotRejectedSizeMessage: string;
	readonly genericErrorMessage: string;
};

export type TelegramChatContentOverrides = Partial<TelegramChatContent>;

export const defaultTelegramChatContent = {
	launcherLabel: "Message Parker",
	panelTitle: "Message Parker",
	panelSubtitle: "Ask about fit, scope, or what to do next.",
	starterMessage:
		"Send a note here. Parker replies from Telegram and the thread stays on this page.",
	messagePlaceholder: "Type your question...",
	bugReportLabel: "Bug",
	bugSummaryPlaceholder: "What broke?",
	bugStepsPlaceholder: "What were you trying to do?",
	bugExpectedPlaceholder: "What did you expect instead?",
	bugImpactLabel: "Bug impact",
	attachScreenshotLabel: "Attach screenshot",
	removeAttachmentLabel: "Remove screenshot",
	sendLabel: "Send",
	closeLabel: "Close support chat",
	fallbackLabel: "Open Telegram",
	directTelegramLabel: "Use Telegram directly",
	loadingLabel: "Loading conversation",
	sendingLabel: "Sending",
	deliveredLabel: "Delivered to Parker",
	failedLabel: "Parker may not have seen this.",
	closedLabel: "This thread is closed.",
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
