import { SupportWidget } from "@/app/_components/support/support-widget";
import type { SupportWidgetContent } from "@/app/_components/support/support-widget-panel";

const workspaceSupportWidgetContent = {
	launcherLabel: "Ask Parker",
	panelTitle: "Ask Parker",
	panelSubtitle: "Ask about setup, review, or your workspace.",
	starterMessage:
		"Send a note from this workspace. Parker replies from Telegram and the thread stays here.",
	messagePlaceholder: "Type a workspace question...",
	sendLabel: "Send",
	closeLabel: "Close support chat",
	fallbackLabel: "Open Telegram",
	directTelegramLabel: "Use Telegram directly",
	loadingLabel: "Loading conversation",
	sendingLabel: "Sending",
	deliveredLabel: "Delivered to Parker",
	failedLabel: "Parker may not have seen this.",
	closedLabel: "This thread is closed.",
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
		/>
	);
}
