import { describe, expect, it, vi } from "vitest";
import type { GenericId } from "convex/values";

import {
	DEFAULT_SUPPORT_AI_DRAFT_MODEL,
	buildSupportAiDraftPrompt,
	buildSupportAiDraftTelegramNote,
	extractOpenAiResponseText,
	generateSupportAiDraftText,
	resolveSupportAiDraftModel,
} from "@/convex/support/aiDrafts";
import type { SupportAiDraftRequest } from "@/convex/support/aiDrafts";

const draftRequest = {
	actionType: "draft_reply",
	fallbackOutput: "Draft reply for Parker:\n\nAsk for their stack.",
	threadContext: {
		supportId: "SBS-0506-1234",
		entrySurface: "homepage_support_widget",
		pagePath: "/",
		visitorKind: "anonymous",
		leadStatus: "standard",
		createdAt: 1,
		messages: [
			{
				id: "message_1" as GenericId<"supportMessages">,
				source: "visitor",
				body: "Can this help me ship a React app by Friday?",
				createdAt: 2,
			},
			{
				id: "message_2" as GenericId<"supportMessages">,
				source: "operator",
				body: "Tell me what is blocked.",
				createdAt: 3,
			},
		],
	},
} satisfies SupportAiDraftRequest;

describe("support AI drafts", () => {
	it("uses the pinned default model unless Convex env overrides it", () => {
		expect(resolveSupportAiDraftModel(undefined)).toBe(
			DEFAULT_SUPPORT_AI_DRAFT_MODEL,
		);
		expect(resolveSupportAiDraftModel("  gpt-custom-snapshot  ")).toBe(
			"gpt-custom-snapshot",
		);
	});

	it("builds prompts from public product context and bounded support context", () => {
		const prompt = buildSupportAiDraftPrompt(draftRequest);

		expect(prompt.instructions).toContain("operator-only support artifacts");
		expect(prompt.input).toContain("Ship by Sunday helps customers");
		expect(prompt.input).toContain("Action: draft_reply");
		expect(prompt.input).toContain("Support id: SBS-0506-1234");
		expect(prompt.input).toContain(
			"Visitor: Can this help me ship a React app by Friday?",
		);
		expect(prompt.input).toContain("Deterministic fallback draft:");
	});

	it("extracts text from current Responses API output shapes", () => {
		expect(
			extractOpenAiResponseText({
				output_text: " Direct response text ",
			}),
		).toBe("Direct response text");

		expect(
			extractOpenAiResponseText({
				output: [
					{
						content: [
							{ type: "output_text", text: "First part" },
							{ type: "refusal", refusal: "ignored" },
						],
					},
					{
						content: [{ type: "output_text", text: "Second part" }],
					},
				],
			}),
		).toBe("First part\nSecond part");

		expect(() => extractOpenAiResponseText({ output: [] })).toThrow(
			"OpenAI response did not include generated text.",
		);
	});

	it("posts to the Responses API with support prompt settings", async () => {
		const fetcher = vi.fn(async () => {
			return new Response(JSON.stringify({ output_text: "Generated draft" }), {
				status: 200,
			});
		});

		await expect(
			generateSupportAiDraftText({
				apiKey: "sk-test",
				model: "gpt-support-snapshot",
				request: draftRequest,
				fetcher,
			}),
		).resolves.toBe("Generated draft");

		expect(fetcher).toHaveBeenCalledWith(
			"https://api.openai.com/v1/responses",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer sk-test",
					"Content-Type": "application/json",
				}),
			}),
		);
		const requestBody = JSON.parse(fetcher.mock.calls[0]?.[1].body ?? "{}") as {
			model?: string;
			reasoning?: { effort?: string };
			store?: boolean;
			text?: { verbosity?: string };
			input?: string;
		};
		expect(requestBody.model).toBe("gpt-support-snapshot");
		expect(requestBody.store).toBe(false);
		expect(requestBody.reasoning).toEqual({ effort: "low" });
		expect(requestBody.text).toEqual({ verbosity: "low" });
		expect(requestBody.input).toContain("Latest bounded transcript:");
	});

	it("reports provider failures without returning a draft", async () => {
		const fetcher = vi.fn(async () => {
			return new Response(
				JSON.stringify({ error: { message: "model unavailable" } }),
				{ status: 429 },
			);
		});

		await expect(
			generateSupportAiDraftText({
				apiKey: "sk-test",
				model: "",
				request: draftRequest,
				fetcher,
			}),
		).rejects.toThrow(
			"OpenAI Responses API failed with status 429: model unavailable",
		);
	});

	it("keeps Telegram AI notes within message limits", () => {
		const note = buildSupportAiDraftTelegramNote({
			actionType: "generate_codex_prompt",
			generatedOutput: "x".repeat(4_000),
			model: "gpt-support-snapshot",
		});

		expect(note).toHaveLength(3_700);
		expect(note).toContain("AI Codex prompt generated");
	});
});
