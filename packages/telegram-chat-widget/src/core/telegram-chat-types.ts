export type TelegramChatMessageSource = "visitor" | "operator" | "system";

export type TelegramChatDeliveryStatus =
	| "not_required"
	| "sending"
	| "delivered_to_parker"
	| "delivery_failed";

export type TelegramChatMessageAttachment = {
	readonly kind: "screenshot";
	readonly fileName: string;
	readonly contentType: string;
	readonly size: number;
	readonly url: string | null;
};

export type TelegramChatMessage = {
	readonly id: string;
	readonly source: TelegramChatMessageSource;
	readonly body: string | null;
	readonly attachment: TelegramChatMessageAttachment | null;
	readonly createdAt: number;
	readonly deliveryStatus: TelegramChatDeliveryStatus;
	readonly deliveryFailureClass: string | null;
};

export type TelegramChatThreadStatus = "empty" | "open" | "closed" | "disabled";

export type TelegramChatThreadState = {
	readonly status: TelegramChatThreadStatus;
	readonly supportId: string | null;
	readonly messages: readonly TelegramChatMessage[];
	readonly fallbackHref: string;
	readonly error: string | null;
};

export type TelegramChatEntrySurface =
	| "homepage_support_widget"
	| "workspace_support_widget"
	| (string & {});

export type TelegramChatPlacement = "bottom-right" | "bottom-left";

export type TelegramChatLauncherMotion = "standard" | "squishy";

export type TelegramChatSurface = "homepage" | "workspace" | (string & {});

export type TelegramChatStatus = "idle" | "loading" | "sending" | "error";

export type TelegramChatMode = "message" | "bug_report";

export type TelegramChatBugImpact = "blocked" | "not_blocked" | "question";

export type TelegramChatBugReportDraft = {
	readonly summary: string;
	readonly steps: string;
	readonly expected: string;
	readonly impact: TelegramChatBugImpact;
};

export type TelegramChatPageContext = {
	readonly pagePath: string;
	readonly viewport: string;
	readonly userAgent: string;
};

export type TelegramChatBugReportPayload = TelegramChatBugReportDraft &
	TelegramChatPageContext;
