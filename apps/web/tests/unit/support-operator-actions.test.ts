import { describe, expect, it } from "vitest";
import type { GenericId } from "convex/values";

import {
	buildSupportActionCallbackData,
	buildSupportOperatorActionEffect,
	buildTelegramSupportActionKeyboard,
	isSupportAiDraftActionType,
	parseSupportActionCallbackData,
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

		expect(callbackDataValues).toHaveLength(
			supportOperatorActionTypeValues.length,
		);
		expect(callbackDataValues.map(parseSupportActionCallbackData)).toEqual(
			expect.arrayContaining(
				supportOperatorActionTypeValues.map((actionType) => ({
					supportId: threadContext.supportId,
					actionType,
				})),
			),
		);
	});

	it("separates customer-visible canned sends from operator-only output", () => {
		expect(
			buildSupportOperatorActionEffect("ask_for_email", threadContext),
		).toMatchObject({
			customerMessageText: expect.stringContaining("best email"),
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

	it("uses the canonical production host for customer-facing pricing links", () => {
		expect(
			buildSupportOperatorActionEffect("send_pricing_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/#pricing");
		expect(
			buildSupportOperatorActionEffect("send_checkout_link", threadContext)
				.customerMessageText,
		).toContain("https://www.man-meets-ai.com/#pricing");
	});
});
