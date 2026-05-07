import type { GenericId } from "convex/values";

export const supportOperatorActionTypeValues = [
	"close_thread",
	"ask_for_email",
	"ask_for_context",
	"send_pricing_link",
	"send_checkout_link",
	"draft_reply",
	"summarize_lead",
	"generate_codex_prompt",
	"create_linear_draft",
	"mark_hot_lead",
] as const;

export type SupportOperatorActionType =
	(typeof supportOperatorActionTypeValues)[number];

export const supportAiDraftActionTypeValues = [
	"draft_reply",
	"summarize_lead",
	"generate_codex_prompt",
	"create_linear_draft",
] as const;

export type SupportAiDraftActionType =
	(typeof supportAiDraftActionTypeValues)[number];

export type SupportOperatorActionDefinition = {
	readonly actionType: SupportOperatorActionType;
	readonly callbackSlug: string;
	readonly buttonLabel: string;
	readonly visibility: "customer_visible" | "operator_only" | "lifecycle";
};

export type SupportActionThreadContext = {
	readonly supportId: string;
	readonly entrySurface: string;
	readonly pagePath: string;
	readonly visitorKind: "anonymous" | "signed_in";
	readonly leadStatus: "standard" | "hot";
	readonly createdAt: number;
	readonly messages: SupportActionMessageContext[];
};

export type SupportActionMessageContext = {
	readonly id: GenericId<"supportMessages">;
	readonly source: "visitor" | "operator" | "system";
	readonly body: string | null;
	readonly createdAt: number;
};

export type SupportOperatorActionEffect = {
	readonly callbackAnswerText: string;
	readonly customerMessageText: string | null;
	readonly generatedOutput: string | null;
	readonly operatorNoteText: string | null;
};

const SUPPORT_PUBLIC_BASE_URL = "https://www.man-meets-ai.com";
const CALLBACK_DATA_BYTE_LIMIT = 64;

const supportOperatorActionDefinitions = [
	{
		actionType: "ask_for_email",
		callbackSlug: "email",
		buttonLabel: "Ask email",
		visibility: "customer_visible",
	},
	{
		actionType: "ask_for_context",
		callbackSlug: "context",
		buttonLabel: "Ask context",
		visibility: "customer_visible",
	},
	{
		actionType: "send_pricing_link",
		callbackSlug: "pricing",
		buttonLabel: "Pricing",
		visibility: "customer_visible",
	},
	{
		actionType: "send_checkout_link",
		callbackSlug: "checkout",
		buttonLabel: "Checkout",
		visibility: "customer_visible",
	},
	{
		actionType: "draft_reply",
		callbackSlug: "draft",
		buttonLabel: "Draft reply",
		visibility: "operator_only",
	},
	{
		actionType: "summarize_lead",
		callbackSlug: "summary",
		buttonLabel: "Summary",
		visibility: "operator_only",
	},
	{
		actionType: "generate_codex_prompt",
		callbackSlug: "codex",
		buttonLabel: "Codex prompt",
		visibility: "operator_only",
	},
	{
		actionType: "create_linear_draft",
		callbackSlug: "linear",
		buttonLabel: "Linear draft",
		visibility: "operator_only",
	},
	{
		actionType: "mark_hot_lead",
		callbackSlug: "hot",
		buttonLabel: "Hot lead",
		visibility: "operator_only",
	},
	{
		actionType: "close_thread",
		callbackSlug: "close",
		buttonLabel: "Close thread",
		visibility: "lifecycle",
	},
] as const satisfies readonly SupportOperatorActionDefinition[];

export function getSupportOperatorActionDefinition(
	actionType: SupportOperatorActionType,
) {
	const definition = supportOperatorActionDefinitions.find(
		(candidate) => candidate.actionType === actionType,
	);
	if (!definition) {
		throw new Error(`Unsupported support operator action: ${actionType}`);
	}

	return definition;
}

export function isSupportAiDraftActionType(
	actionType: SupportOperatorActionType,
): actionType is SupportAiDraftActionType {
	return supportAiDraftActionTypeValues.includes(
		actionType as SupportAiDraftActionType,
	);
}

export function buildSupportActionCallbackData(
	supportId: string,
	actionType: SupportOperatorActionType,
) {
	const definition = getSupportOperatorActionDefinition(actionType);
	const callbackData = `support:${supportId}:${definition.callbackSlug}`;
	if (
		new TextEncoder().encode(callbackData).byteLength > CALLBACK_DATA_BYTE_LIMIT
	) {
		throw new Error("Support action callback data exceeds Telegram's limit.");
	}

	return callbackData;
}

export function parseSupportActionCallbackData(callbackData: string) {
	const match = callbackData.match(/^support:([A-Z0-9-]+):([a-z_]+)$/);
	if (!match) {
		return null;
	}

	const [, supportId, callbackSlug] = match;
	const definition = supportOperatorActionDefinitions.find(
		(candidate) => candidate.callbackSlug === callbackSlug,
	);
	if (!supportId || !definition) {
		return null;
	}

	return {
		supportId,
		actionType: definition.actionType,
	};
}

export function buildTelegramSupportActionKeyboard(supportId: string) {
	return {
		inline_keyboard: [
			[
				buildButton("ask_for_email", supportId),
				buildButton("ask_for_context", supportId),
			],
			[
				buildButton("send_pricing_link", supportId),
				buildButton("send_checkout_link", supportId),
			],
			[
				buildButton("draft_reply", supportId),
				buildButton("summarize_lead", supportId),
			],
			[
				buildButton("generate_codex_prompt", supportId),
				buildButton("create_linear_draft", supportId),
			],
			[
				buildButton("mark_hot_lead", supportId),
				buildButton("close_thread", supportId),
			],
		],
	};
}

export function buildSupportOperatorActionEffect(
	actionType: SupportOperatorActionType,
	context: SupportActionThreadContext,
): SupportOperatorActionEffect {
	switch (actionType) {
		case "ask_for_email":
			return buildCustomerVisibleEffect(
				"Sent email ask.",
				"What's the best email if we get disconnected? You can keep chatting here too.",
			);
		case "ask_for_context":
			return buildCustomerVisibleEffect(
				"Sent context ask.",
				"Can you share what you're trying to ship, what stack you're using, and what feels blocked right now?",
			);
		case "send_pricing_link":
			return buildCustomerVisibleEffect(
				"Sent pricing link.",
				`Pricing is here: ${SUPPORT_PUBLIC_BASE_URL}/#pricing\n\nIf you're not sure which path fits, send a note here and I'll help.`,
			);
		case "send_checkout_link":
			return buildCustomerVisibleEffect(
				"Sent checkout link.",
				`Checkout starts from the pricing section: ${SUPPORT_PUBLIC_BASE_URL}/#pricing\n\nUse Generate my codebase when you're ready.`,
			);
		case "draft_reply":
			return buildOperatorOnlyEffect(
				"Draft generated.",
				buildDraftReplyOutput(context),
			);
		case "summarize_lead":
			return buildOperatorOnlyEffect(
				"Summary generated.",
				buildLeadSummaryOutput(context),
			);
		case "generate_codex_prompt":
			return buildOperatorOnlyEffect(
				"Codex prompt generated.",
				buildCodexPromptOutput(context),
			);
		case "create_linear_draft":
			return buildOperatorOnlyEffect(
				"Linear draft generated.",
				buildLinearDraftOutput(context),
			);
		case "mark_hot_lead":
			return buildOperatorOnlyEffect(
				"Marked hot.",
				`Hot lead marked for ${context.supportId}.`,
			);
		case "close_thread":
			return {
				callbackAnswerText: "Thread closed.",
				customerMessageText: null,
				generatedOutput: null,
				operatorNoteText: null,
			};
	}
}

function buildButton(actionType: SupportOperatorActionType, supportId: string) {
	const definition = getSupportOperatorActionDefinition(actionType);
	return {
		text: definition.buttonLabel,
		callback_data: buildSupportActionCallbackData(
			supportId,
			definition.actionType,
		),
	};
}

function buildCustomerVisibleEffect(
	callbackAnswerText: string,
	customerMessageText: string,
): SupportOperatorActionEffect {
	return {
		callbackAnswerText,
		customerMessageText,
		generatedOutput: null,
		operatorNoteText: `Sent to visitor:\n\n${customerMessageText}`,
	};
}

function buildOperatorOnlyEffect(
	callbackAnswerText: string,
	generatedOutput: string,
): SupportOperatorActionEffect {
	return {
		callbackAnswerText,
		customerMessageText: null,
		generatedOutput,
		operatorNoteText: generatedOutput,
	};
}

function buildDraftReplyOutput(context: SupportActionThreadContext) {
	const latestVisitorText = getLatestVisitorText(context);
	return [
		"Draft reply for Parker:",
		"",
		"Hey - yes, I can help with this. The fastest next step is to tell me what you're trying to ship, what stack or repo you have, and where it feels blocked. Then I can point you to the right Ship by Sunday path.",
		"",
		`Latest visitor note: ${quoteSnippet(latestVisitorText)}`,
	].join("\n");
}

function buildLeadSummaryOutput(context: SupportActionThreadContext) {
	const visitorMessageCount = context.messages.filter(
		(message) => message.source === "visitor",
	).length;
	const operatorMessageCount = context.messages.filter(
		(message) => message.source === "operator",
	).length;

	return [
		"Lead summary:",
		`Support: ${context.supportId}`,
		`Entry: ${context.entrySurface} ${context.pagePath}`,
		`Visitor: ${context.visitorKind}`,
		`Priority: ${context.leadStatus}`,
		`Messages: ${visitorMessageCount} visitor, ${operatorMessageCount} operator`,
		`Latest visitor note: ${quoteSnippet(getLatestVisitorText(context))}`,
		"Suggested next move: ask for product context if it is missing; otherwise answer directly or point them to pricing.",
	].join("\n");
}

function buildCodexPromptOutput(context: SupportActionThreadContext) {
	return [
		"Codex prompt draft:",
		"",
		"You are helping Parker from Ship by Sunday answer a support lead. Draft a concise Telegram reply that is specific, honest, and does not promise a response time.",
		"",
		`Support id: ${context.supportId}`,
		`Visitor context: ${quoteSnippet(getLatestVisitorText(context))}`,
		"",
		"Include one concrete next question if the visitor has not shared their product, stack, or blocker yet. Do not send the reply automatically.",
	].join("\n");
}

function buildLinearDraftOutput(context: SupportActionThreadContext) {
	const latestVisitorText = getLatestVisitorText(context);
	return [
		"Linear issue draft:",
		`Title: Support ${context.supportId} - ${truncateSupportText(latestVisitorText, 80)}`,
		"",
		"Description:",
		`Visitor asked: ${quoteSnippet(latestVisitorText)}`,
		`Entry: ${context.entrySurface} ${context.pagePath}`,
		"Next action: decide whether this is support, sales follow-up, or a product bug before creating an issue.",
	].join("\n");
}

function getLatestVisitorText(context: SupportActionThreadContext) {
	for (let index = context.messages.length - 1; index >= 0; index -= 1) {
		const message = context.messages[index];
		if (message?.source === "visitor" && message.body) {
			return message.body;
		}
	}

	return "No visitor message captured yet.";
}

function quoteSnippet(value: string) {
	return `"${truncateSupportText(value, 240)}"`;
}

function truncateSupportText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, " ");
	if (normalized.length <= maxLength) {
		return normalized;
	}

	return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
}
