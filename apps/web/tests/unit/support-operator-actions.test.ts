import { describe, expect, it } from "vitest";
import type { GenericId } from "convex/values";

import {
	buildSupportActionCallbackData,
	buildSupportDraftDecisionCallbackData,
	buildSupportOperatorActionEffect,
	buildTelegramDraftDecisionKeyboard,
	buildTelegramSupportActionKeyboard,
	isSupportAiDraftActionType,
	parseSupportActionCallbackData,
	parseSupportDraftDecisionCallbackData,
	supportAiDraftActionTypeValues,
	supportOperatorActionTypeValues,
	type SupportActionThreadContext,
} from "@/convex/support/operatorActions";

const threadContext = {
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
			body: "Can this help me ship my React app by Friday?",
			createdAt: 2,
		},
	],
} satisfies SupportActionThreadContext;

describe("support operator actions", () => {
	it("builds compact Telegram callback data for every action", () => {
		for (const actionType of supportOperatorActionTypeValues) {
			const callbackData = buildSupportActionCallbackData(
				threadContext.supportId,
				actionType,
			);

			expect(
				new TextEncoder().encode(callbackData).byteLength,
			).toBeLessThanOrEqual(64);
			expect(parseSupportActionCallbackData(callbackData)).toEqual({
				supportId: threadContext.supportId,
				actionType,
			});
		}
	});

	it("builds a Telegram keyboard with only parseable action callbacks", () => {
		const keyboard = buildTelegramSupportActionKeyboard(
			threadContext.supportId,
		);
		const callbackDataValues = keyboard.inline_keyboard
			.flat()
			.map((button) => button.callback_data);

		expect(
			keyboard.inline_keyboard.map((row) => row.map((button) => button.text)),
		).toEqual([["Yoooo", "Whatcha"], ["Draft Parker"], ["Close"]]);
		expect(callbackDataValues).toHaveLength(4);
		expect(callbackDataValues.map(parseSupportActionCallbackData)).toEqual([
			{ supportId: threadContext.supportId, actionType: "ask_how_found" },
			{
				supportId: threadContext.supportId,
				actionType: "ask_what_building",
			},
			{ supportId: threadContext.supportId, actionType: "draft_reply" },
			{ supportId: threadContext.supportId, actionType: "close_thread" },
		]);
	});

	it("separates customer-visible canned sends from operator-only output", () => {
		expect(
			buildSupportOperatorActionEffect("ask_how_found", threadContext),
		).toMatchObject({
			customerMessageText: "Yooo - how'd you find my site?",
			generatedOutput: null,
			operatorNoteText: expect.stringContaining("Sent to visitor"),
		});
		expect(
			buildSupportOperatorActionEffect("ask_what_building", threadContext),
		).toMatchObject({
			customerMessageText: "Whatcha trying to make?",
			generatedOutput: null,
			operatorNoteText: expect.stringContaining("Sent to visitor"),
		});

		expect(
			buildSupportOperatorActionEffect("generate_codex_prompt", threadContext),
		).toMatchObject({
			customerMessageText: null,
			generatedOutput: expect.stringContaining("Codex prompt draft"),
			operatorNoteText: expect.stringContaining("Codex prompt draft"),
		});
	});

	it("identifies only AI-backed operator draft actions", () => {
		expect(
			supportOperatorActionTypeValues.filter(isSupportAiDraftActionType),
		).toEqual([...supportAiDraftActionTypeValues]);
		expect(isSupportAiDraftActionType("mark_hot_lead")).toBe(false);
		expect(isSupportAiDraftActionType("send_pricing_link")).toBe(false);
	});

	it("builds compact draft decision callbacks for reviewable AI replies", () => {
		const operatorActionId =
			"kg2a1a1a1a1a1a1a1a1a1a1a1a6ab123" as GenericId<"supportOperatorActions">;
		const sendCallbackData = buildSupportDraftDecisionCallbackData(
			operatorActionId,
			"send",
		);
		const discardCallbackData = buildSupportDraftDecisionCallbackData(
			operatorActionId,
			"discard",
		);
		const keyboard = buildTelegramDraftDecisionKeyboard(operatorActionId);

		expect(
			new TextEncoder().encode(sendCallbackData).byteLength,
		).toBeLessThanOrEqual(64);
		expect(parseSupportDraftDecisionCallbackData(sendCallbackData)).toEqual({
			operatorActionId,
			decision: "send",
		});
		expect(parseSupportDraftDecisionCallbackData(discardCallbackData)).toEqual({
			operatorActionId,
			decision: "discard",
		});
		expect(
			keyboard.inline_keyboard.map((row) => row.map((button) => button.text)),
		).toEqual([["Send draft", "Discard"]]);
	});

	it("uses the canonical production host for customer-facing pricing links", () => {
		expect(
			buildSupportOperatorActionEffect("send_pricing_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/starter");
		expect(
			buildSupportOperatorActionEffect("send_pricing_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/workers");
		expect(
			buildSupportOperatorActionEffect("send_checkout_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/starter");
		expect(
			buildSupportOperatorActionEffect("send_checkout_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/workers");
	});
});
