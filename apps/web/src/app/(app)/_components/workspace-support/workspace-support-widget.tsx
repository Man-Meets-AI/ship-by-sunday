import { SupportWidget } from "@/app/_components/support/support-widget";
import type { SupportWidgetContent } from "@/app/_components/support/support-widget";

const workspaceSupportWidgetContent = {
	launcherLabel: "Ask Parker",
	panelTitle: "Ask Parker",
	panelSubtitle: "Ask about setup, review, or the app.",
	starterMessage:
		"Send a note from the app. Parker replies from Telegram and the thread stays here.",
	messagePlaceholder: "Type an app question...",
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

export function WorkspaceSupportWidget({
	fallbackHref,
}: {
	readonly fallbackHref: string;
}) {
	return (
		<SupportWidget
			analyticsSurface="workspace"
			content={workspaceSupportWidgetContent}
			entrySurface="workspace_support_widget"
			fallbackHref={fallbackHref}
			launcherMotion="standard"
		/>
	);
}
