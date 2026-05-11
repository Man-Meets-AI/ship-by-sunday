import type {
	TelegramChatBugImpact,
	TelegramChatBugReportDraft,
	TelegramChatBugReportPayload,
	TelegramChatPageContext,
} from "./telegram-chat-types";

export const TELEGRAM_CHAT_BUG_REPORT_MAX_LENGTH = 2_000;

export function createTelegramChatBugReportPayload({
	draft,
	pageContext,
}: {
	readonly draft: TelegramChatBugReportDraft;
	readonly pageContext: TelegramChatPageContext;
}): TelegramChatBugReportPayload | null {
	const summary = draft.summary.trim();
	if (!summary) {
		return null;
	}

	return {
		summary,
		steps: draft.steps.trim(),
		expected: draft.expected.trim(),
		impact: draft.impact,
		pagePath: normalizeBugReportContextValue(pageContext.pagePath, "/"),
		viewport: normalizeBugReportContextValue(pageContext.viewport, "unknown"),
		userAgent: normalizeBugReportContextValue(pageContext.userAgent, "unknown"),
	};
}

export function renderTelegramChatBugReportBody(
	payload: TelegramChatBugReportPayload,
) {
	if (!payload.summary.trim()) {
		return "";
	}

	return [
		"Bug report",
		`Impact: ${formatTelegramChatBugImpact(payload.impact)}`,
		`Page: ${payload.pagePath}`,
		`Viewport: ${payload.viewport}`,
		`Browser: ${payload.userAgent}`,
		"",
		`What happened: ${payload.summary.trim()}`,
		formatOptionalBugReportLine("What I was doing", payload.steps),
		formatOptionalBugReportLine("Expected", payload.expected),
	]
		.filter((line): line is string => typeof line === "string")
		.join("\n")
		.slice(0, TELEGRAM_CHAT_BUG_REPORT_MAX_LENGTH);
}

export function formatTelegramChatBugImpact(impact: TelegramChatBugImpact) {
	switch (impact) {
		case "blocked":
			return "Blocking me";
		case "not_blocked":
			return "Not blocked";
		case "question":
			return "Not sure if this is a bug";
	}
}

function normalizeBugReportContextValue(value: string, fallback: string) {
	const normalized = value.trim();
	return normalized ? normalized.slice(0, 256) : fallback;
}

function formatOptionalBugReportLine(label: string, value: string) {
	const normalized = value.trim();
	return normalized ? `${label}: ${normalized}` : null;
}
