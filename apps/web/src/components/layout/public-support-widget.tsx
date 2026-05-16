import { SupportWidget } from "@/app/_components/support/support-widget";
import type { SupportWidgetContent } from "@/app/_components/support/support-widget";
import { starterHomePageConfig } from "@/config/product";

export const publicSupportWidgetContent = {
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
} satisfies SupportWidgetContent;

export function PublicSupportWidget() {
	if (!starterHomePageConfig.supportWidget.enabled) {
		return null;
	}

	return (
		<SupportWidget
			analyticsSurface="homepage"
			content={publicSupportWidgetContent}
			entrySurface="homepage_support_widget"
			fallbackHref={starterHomePageConfig.supportWidget.fallbackHref}
			launcherMotion="squishy"
		/>
	);
}
