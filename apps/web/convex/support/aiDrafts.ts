import {
	type SupportActionThreadContext,
	type SupportAiDraftActionType,
	type SupportOperatorActionType,
	isSupportAiDraftActionType,
} from "./operatorActions";

export const DEFAULT_SUPPORT_AI_DRAFT_MODEL = "gpt-5.4-mini-2026-03-17";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_TELEGRAM_AI_NOTE_LENGTH = 3_700;

type Fetcher = (
	input: string,
	init: {
		method: "POST";
		headers: Record<string, string>;
		body: string;
	},
) => Promise<Response>;

export type SupportAiDraftRequest = {
	readonly actionType: SupportAiDraftActionType;
	readonly threadContext: SupportActionThreadContext;
	readonly fallbackOutput: string;
};

export function resolveSupportAiDraftModel(
	rawModel: string | null | undefined,
) {
	const normalized = rawModel?.trim();
	return normalized || DEFAULT_SUPPORT_AI_DRAFT_MODEL;
}

export function buildSupportAiDraftPrompt(request: SupportAiDraftRequest) {
	return {
		instructions: [
			"You help Parker from Ship by Sunday draft private operator-only support artifacts.",
			"Use the supplied public product context and support transcript only.",
			"Never claim a message was sent to the visitor.",
			"Never promise a response time or live availability.",
			"Do not include hidden chain-of-thought or analysis.",
			"Output only the requested artifact.",
		].join("\n"),
		input: [
			"Public product context:",
			"- Ship by Sunday helps customers turn a product idea or existing codebase into a reviewable codebase artifact.",
			"- The homepage support widget is asynchronous and Parker-first. Visitors can ask about fit, setup, checkout, or their codebase.",
			"- Pricing and checkout currently route through the homepage pricing section.",
			"- AI-generated support output is private to Parker until Parker sends or edits a normal reply.",
			"",
			`Action: ${request.actionType}`,
			`Support id: ${request.threadContext.supportId}`,
			`Entry: ${request.threadContext.entrySurface} ${request.threadContext.pagePath}`,
			`Visitor kind: ${request.threadContext.visitorKind}`,
			`Lead priority: ${request.threadContext.leadStatus}`,
			"",
			"Latest bounded transcript:",
			formatTranscript(request.threadContext),
			"",
			"Deterministic fallback draft:",
			request.fallbackOutput,
			"",
			getActionInstruction(request.actionType),
		].join("\n"),
	};
}

export async function generateSupportAiDraftText({
	apiKey,
	model,
	request,
	fetcher = fetch,
}: {
	readonly apiKey: string;
	readonly model: string;
	readonly request: SupportAiDraftRequest;
	readonly fetcher?: Fetcher;
}) {
	const normalizedApiKey = apiKey.trim();
	if (!normalizedApiKey) {
		throw new Error("OpenAI API key is required for support AI drafts.");
	}

	const normalizedModel = resolveSupportAiDraftModel(model);
	const prompt = buildSupportAiDraftPrompt(request);
	const response = await fetcher(OPENAI_RESPONSES_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${normalizedApiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: normalizedModel,
			instructions: prompt.instructions,
			input: prompt.input,
			store: false,
			reasoning: { effort: "low" },
			text: { verbosity: "low" },
			max_output_tokens: 900,
		}),
	});

	const bodyText = await response.text();
	let parsedBody: unknown = null;
	try {
		parsedBody = JSON.parse(bodyText) as unknown;
	} catch {
		parsedBody = null;
	}

	if (!response.ok) {
		throw new Error(
			`OpenAI Responses API failed with status ${response.status}${formatOpenAiErrorSuffix(parsedBody, bodyText)}`,
		);
	}

	return truncateSupportAiDraftText(extractOpenAiResponseText(parsedBody));
}

export function extractOpenAiResponseText(responseBody: unknown) {
	if (!isRecord(responseBody)) {
		throw new Error("OpenAI response did not include generated text.");
	}

	if (typeof responseBody.output_text === "string") {
		const outputText = responseBody.output_text.trim();
		if (outputText) {
			return outputText;
		}
	}

	const textParts: string[] = [];
	if (Array.isArray(responseBody.output)) {
		for (const outputItem of responseBody.output) {
			if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) {
				continue;
			}
			for (const contentPart of outputItem.content) {
				if (
					isRecord(contentPart) &&
					contentPart.type === "output_text" &&
					typeof contentPart.text === "string" &&
					contentPart.text.trim()
				) {
					textParts.push(contentPart.text.trim());
				}
			}
		}
	}

	const outputText = textParts.join("\n").trim();
	if (!outputText) {
		throw new Error("OpenAI response did not include generated text.");
	}

	return outputText;
}

export function buildSupportAiDraftTelegramNote({
	actionType,
	generatedOutput,
	model,
}: {
	readonly actionType: SupportAiDraftActionType;
	readonly generatedOutput: string;
	readonly model: string;
}) {
	return truncateSupportAiDraftText(
		[
			`${getActionTitle(actionType)} generated with ${model}:`,
			"",
			generatedOutput,
		].join("\n"),
	);
}

export function buildSupportAiDraftFallbackTelegramNote({
	actionType,
	fallbackOutput,
	failureReason,
}: {
	readonly actionType: SupportAiDraftActionType;
	readonly fallbackOutput: string;
	readonly failureReason: string;
}) {
	return truncateSupportAiDraftText(
		[
			`${getActionTitle(actionType)} used deterministic fallback.`,
			`Reason: ${failureReason}`,
			"",
			fallbackOutput,
		].join("\n"),
	);
}

export function isSupportAiDraftAction(
	actionType: SupportOperatorActionType,
): actionType is SupportAiDraftActionType {
	return isSupportAiDraftActionType(actionType);
}

export function normalizeSupportAiDraftFailureReason(error: unknown) {
	const message = error instanceof Error ? error.message : "Unknown AI error.";
	return message.slice(0, 500);
}

function formatTranscript(context: SupportActionThreadContext) {
	const transcriptLines = context.messages
		.filter((message) => message.body)
		.map((message) => {
			const speaker =
				message.source === "visitor"
					? "Visitor"
					: message.source === "operator"
						? "Parker"
						: "System";
			return `${speaker}: ${truncateInlineText(message.body ?? "", 500)}`;
		});

	return transcriptLines.length > 0
		? transcriptLines.join("\n")
		: "No transcript messages yet.";
}

function getActionInstruction(actionType: SupportAiDraftActionType) {
	switch (actionType) {
		case "draft_reply":
			return "Write one concise reply Parker could send after reviewing it. Keep it specific to the visitor and ask at most one next question.";
		case "summarize_lead":
			return "Write a compact operator summary with the visitor goal, likely fit, missing context, and best next move.";
		case "generate_codex_prompt":
			return "Write a paste-ready Codex prompt Parker can use to draft a support response or investigate the visitor's need. Include the support context and acceptance criteria.";
		case "create_linear_draft":
			return "Write a paste-ready Linear issue draft with Title, Description, Context, and Next action. Do not imply an issue has been created.";
	}
}

function getActionTitle(actionType: SupportAiDraftActionType) {
	switch (actionType) {
		case "draft_reply":
			return "AI reply draft";
		case "summarize_lead":
			return "AI lead summary";
		case "generate_codex_prompt":
			return "AI Codex prompt";
		case "create_linear_draft":
			return "AI Linear draft";
	}
}

function formatOpenAiErrorSuffix(parsedBody: unknown, bodyText: string) {
	const parsedMessage = getOpenAiErrorMessage(parsedBody);
	const message = parsedMessage || bodyText.trim();
	return message ? `: ${message.slice(0, 500)}` : ".";
}

function getOpenAiErrorMessage(value: unknown): string | null {
	if (!isRecord(value) || !isRecord(value.error)) {
		return null;
	}

	return typeof value.error.message === "string" ? value.error.message : null;
}

function truncateSupportAiDraftText(value: string) {
	const normalized = value.trim();
	if (normalized.length <= MAX_TELEGRAM_AI_NOTE_LENGTH) {
		return normalized;
	}

	return `${normalized.slice(0, MAX_TELEGRAM_AI_NOTE_LENGTH - 3)}...`;
}

function truncateInlineText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, " ");
	if (normalized.length <= maxLength) {
		return normalized;
	}

	return `${normalized.slice(0, maxLength - 3)}...`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
