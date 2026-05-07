import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	classifySupportDeliveryError,
	parseTelegramSupportOperatorIds,
	parseTelegramSupportUpdate,
} from "@/convex/support/telegram";

describe("telegram support updates", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("parses operator replies from the configured support chat and topic", () => {
		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 100,
					message: {
						message_id: 200,
						message_thread_id: 300,
						chat: { id: "-100123" },
						from: { id: 42, is_bot: false },
						text: "Yes, send me the app shape.",
					},
				},
				[42],
				"-100123",
			),
		).toEqual({
			kind: "operator_message",
			updateId: 100,
			chatId: "-100123",
			messageThreadId: 300,
			telegramMessageId: 200,
			operatorTelegramUserId: 42,
			text: "Yes, send me the app shape.",
		});
	});

	it("parses inline operator action callbacks", () => {
		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 101,
					callback_query: {
						id: "callback_123",
						from: { id: 42 },
						data: "support:SBS-0506-1234:close",
						message: {
							message_id: 201,
							message_thread_id: 301,
							chat: { id: "-100123" },
						},
					},
				},
				[42],
				"-100123",
			),
		).toEqual({
			kind: "operator_action",
			updateId: 101,
			callbackQueryId: "callback_123",
			chatId: "-100123",
			messageThreadId: 301,
			operatorTelegramUserId: 42,
			supportId: "SBS-0506-1234",
			actionType: "close_thread",
		});

		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 102,
					callback_query: {
						id: "callback_124",
						from: { id: 42 },
						data: "support:SBS-0506-1234:pricing",
						message: {
							message_id: 201,
							message_thread_id: 301,
							chat: { id: "-100123" },
						},
					},
				},
				[42],
				"-100123",
			),
		).toMatchObject({
			kind: "operator_action",
			supportId: "SBS-0506-1234",
			actionType: "send_pricing_link",
		});
	});

	it("ignores unsupported or unauthorized updates without forcing webhook retries", () => {
		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 102,
					message: {
						message_id: 202,
						message_thread_id: 302,
						chat: { id: "-100999" },
						from: { id: 42, is_bot: false },
						text: "wrong chat",
					},
				},
				[42],
				"-100123",
			),
		).toEqual({ kind: "ignored", reason: "unknown_chat" });

		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 103,
					message: {
						message_id: 203,
						message_thread_id: 303,
						chat: { id: "-100123" },
						from: { id: 77, is_bot: false },
						text: "unknown operator",
					},
				},
				[42],
				"-100123",
			),
		).toEqual({ kind: "ignored", reason: "unknown_operator" });
	});

	it("ignores overlong operator replies before Convex message normalization can throw", () => {
		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 104,
					message: {
						message_id: 204,
						message_thread_id: 304,
						chat: { id: "-100123" },
						from: { id: 42, is_bot: false },
						text: "x".repeat(2001),
					},
				},
				[42],
				"-100123",
			),
		).toEqual({ kind: "ignored", reason: "operator_reply_too_long" });
	});

	it("carries ignored callback ids so the webhook can answer Telegram clients", () => {
		expect(
			parseTelegramSupportUpdate(
				{
					update_id: 105,
					callback_query: {
						id: "callback_ignored",
						from: { id: 77 },
						data: "support:SBS-0506-1234:pricing",
						message: {
							message_id: 205,
							message_thread_id: 305,
							chat: { id: "-100123" },
						},
					},
				},
				[42],
				"-100123",
			),
		).toEqual({
			kind: "ignored",
			reason: "unknown_operator",
			callbackQueryId: "callback_ignored",
			callbackAnswerText: "Action unavailable.",
		});
	});

	it("answers ignored callback queries from the webhook action", async () => {
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		process.env.TELEGRAM_SUPPORT_CHAT_ID = "-100123";
		process.env.TELEGRAM_SUPPORT_OPERATOR_USER_IDS = "42";
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input) => {
				if (String(input).includes("sendMessage")) {
					return new Response(
						JSON.stringify({ ok: true, result: { message_id: 444 } }),
						{ status: 200 },
					);
				}

				return new Response(JSON.stringify({ ok: true, result: true }), {
					status: 200,
				});
			});
		const { processTelegramSupportWebhookUpdate } =
			await import("@/convex/support");
		const action = processTelegramSupportWebhookUpdate as unknown as {
			_handler: (
				ctx: { runMutation: ReturnType<typeof vi.fn> },
				args: { payload: unknown },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runMutation: vi.fn() },
				{
					payload: {
						update_id: 106,
						callback_query: {
							id: "callback_unknown",
							from: { id: 77 },
							data: "support:SBS-0506-1234:pricing",
							message: {
								message_id: 206,
								message_thread_id: 306,
								chat: { id: "-100123" },
							},
						},
					},
				},
			),
		).resolves.toEqual({
			ok: true,
			ignored: true,
			reason: "unknown_operator",
		});
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.telegram.org/botsupport-token/answerCallbackQuery",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({
					callback_query_id: "callback_unknown",
					text: "Action unavailable.",
				}),
			}),
		);
	});

	it("returns ignored for authenticated webhook updates when support routing env is missing", async () => {
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		delete process.env.TELEGRAM_SUPPORT_CHAT_ID;
		delete process.env.TELEGRAM_SUPPORT_OPERATOR_USER_IDS;
		const runMutation = vi.fn();
		const { processTelegramSupportWebhookUpdate } =
			await import("@/convex/support");
		const action = processTelegramSupportWebhookUpdate as unknown as {
			_handler: (
				ctx: { runMutation: ReturnType<typeof vi.fn> },
				args: { payload: unknown },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runMutation },
				{
					payload: {
						update_id: 107,
						message: {
							message_id: 207,
							message_thread_id: 307,
							chat: { id: "-100123" },
							from: { id: 42, is_bot: false },
							text: "hello",
						},
					},
				},
			),
		).resolves.toEqual({
			ok: true,
			ignored: true,
			reason: "missing_support_chat_config",
		});
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("acknowledges AI draft callbacks scheduled by the mutation without sending fallback immediately", async () => {
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		process.env.TELEGRAM_SUPPORT_CHAT_ID = "-100123";
		process.env.TELEGRAM_SUPPORT_OPERATOR_USER_IDS = "42";
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input) => {
				if (String(input).includes("sendMessage")) {
					return new Response(
						JSON.stringify({ ok: true, result: { message_id: 444 } }),
						{ status: 200 },
					);
				}

				return new Response(JSON.stringify({ ok: true, result: true }), {
					status: 200,
				});
			});
		const runMutation = vi.fn().mockResolvedValue({
			ok: true,
			ignored: false,
			reason: null,
			callbackAnswerText: "Generating AI draft.",
			operatorNoteText: null,
			operatorActionId: "action_1",
			aiDraftSchedulingStatus: "scheduled",
			aiDraftSchedulingFailureReason: null,
		});
		const { processTelegramSupportWebhookUpdate } =
			await import("@/convex/support");
		const action = processTelegramSupportWebhookUpdate as unknown as {
			_handler: (
				ctx: {
					runMutation: ReturnType<typeof vi.fn>;
				},
				args: { payload: unknown },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runMutation },
				{
					payload: {
						update_id: 107,
						callback_query: {
							id: "callback_draft",
							from: { id: 42 },
							data: "support:SBS-0506-1234:draft",
							message: {
								message_id: 207,
								message_thread_id: 307,
								chat: { id: "-100123" },
							},
						},
					},
				},
			),
		).resolves.toEqual({
			ok: true,
			ignored: false,
			reason: null,
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.telegram.org/botsupport-token/answerCallbackQuery",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({
					callback_query_id: "callback_draft",
					text: "Generating AI draft.",
				}),
			}),
		);
	});

	it("sends and records deterministic fallback notes when mutation scheduling fails", async () => {
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		process.env.TELEGRAM_SUPPORT_CHAT_ID = "-100123";
		process.env.TELEGRAM_SUPPORT_OPERATOR_USER_IDS = "42";
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input) => {
				if (String(input).includes("sendMessage")) {
					return new Response(
						JSON.stringify({ ok: true, result: { message_id: 444 } }),
						{ status: 200 },
					);
				}

				return new Response(JSON.stringify({ ok: true, result: true }), {
					status: 200,
				});
			});
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				ignored: false,
				reason: null,
				callbackAnswerText: "AI draft fallback saved.",
				operatorNoteText: "Deterministic fallback draft",
				operatorActionId: "action_1",
				aiDraftSchedulingStatus: "scheduling_failed",
				aiDraftSchedulingFailureReason:
					"AI draft scheduling failed: scheduler unavailable",
			})
			.mockResolvedValueOnce(null);
		const { processTelegramSupportWebhookUpdate } =
			await import("@/convex/support");
		const action = processTelegramSupportWebhookUpdate as unknown as {
			_handler: (
				ctx: {
					runMutation: ReturnType<typeof vi.fn>;
				},
				args: { payload: unknown },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runMutation },
				{
					payload: {
						update_id: 108,
						callback_query: {
							id: "callback_draft_fail",
							from: { id: 42 },
							data: "support:SBS-0506-1234:draft",
							message: {
								message_id: 208,
								message_thread_id: 308,
								chat: { id: "-100123" },
							},
						},
					},
				},
			),
		).resolves.toEqual({
			ok: true,
			ignored: false,
			reason: null,
		});

		expect(runMutation).toHaveBeenLastCalledWith(
			expect.anything(),
			expect.objectContaining({
				operatorActionId: "action_1",
				status: "delivered",
				telegramMessageId: 444,
				failureReason: null,
			}),
		);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenLastCalledWith(
			"https://api.telegram.org/botsupport-token/sendMessage",
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("used deterministic fallback"),
			}),
		);
	});

	it("records deterministic fallback metadata when scheduled OpenAI generation fails", async () => {
		process.env.OPENAI_API_KEY = "openai-token";
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		process.env.TELEGRAM_SUPPORT_CHAT_ID = "-100123";
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input) => {
				if (String(input).includes("api.openai.com")) {
					return new Response(
						JSON.stringify({ error: { message: "provider down" } }),
						{ status: 500 },
					);
				}

				return new Response(
					JSON.stringify({
						ok: true,
						result: { message_id: 444, message_thread_id: 307 },
					}),
					{ status: 200 },
				);
			});
		const runQuery = vi.fn().mockResolvedValue({
			operatorActionId: "action_1",
			actionType: "draft_reply",
			fallbackOutput: "Deterministic fallback draft",
			threadContext: {
				supportId: "SBS-0506-1234",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				visitorKind: "anonymous",
				leadStatus: "standard",
				createdAt: 1,
				messages: [],
			},
		});
		const runMutation = vi.fn().mockResolvedValue(null);
		const { generateSupportOperatorAiDraft } = await import("@/convex/support");
		const action = generateSupportOperatorAiDraft as unknown as {
			_handler: (
				ctx: {
					runQuery: ReturnType<typeof vi.fn>;
					runMutation: ReturnType<typeof vi.fn>;
				},
				args: { operatorActionId: string; messageThreadId: number },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runQuery, runMutation },
				{ operatorActionId: "action_1", messageThreadId: 307 },
			),
		).resolves.toBeNull();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(runMutation).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				operatorActionId: "action_1",
				generatedOutput: "Deterministic fallback draft",
				generatedOutputSource: "deterministic",
				generationFailureReason: expect.stringContaining(
					"OpenAI Responses API failed",
				),
			}),
		);
		expect(runMutation).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining({
				operatorActionId: "action_1",
				status: "delivered",
				telegramMessageId: 444,
				failureReason: null,
			}),
		);
	});

	it("records operator-note delivery failure separately from AI generation success", async () => {
		process.env.OPENAI_API_KEY = "openai-token";
		process.env.TELEGRAM_SUPPORT_BOT_TOKEN = "support-token";
		process.env.TELEGRAM_SUPPORT_CHAT_ID = "-100123";
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input) => {
				if (String(input).includes("api.openai.com")) {
					return new Response(
						JSON.stringify({ output_text: "Generated draft" }),
						{
							status: 200,
						},
					);
				}

				return new Response(
					JSON.stringify({
						ok: false,
						description: "Forbidden: not enough rights",
					}),
					{ status: 403 },
				);
			});
		const runQuery = vi.fn().mockResolvedValue({
			operatorActionId: "action_1",
			actionType: "summarize_lead",
			fallbackOutput: "Fallback summary",
			threadContext: {
				supportId: "SBS-0506-1234",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				visitorKind: "anonymous",
				leadStatus: "hot",
				createdAt: 1,
				messages: [],
			},
		});
		const runMutation = vi.fn().mockResolvedValue(null);
		const { generateSupportOperatorAiDraft } = await import("@/convex/support");
		const action = generateSupportOperatorAiDraft as unknown as {
			_handler: (
				ctx: {
					runQuery: ReturnType<typeof vi.fn>;
					runMutation: ReturnType<typeof vi.fn>;
				},
				args: { operatorActionId: string; messageThreadId: number },
			) => Promise<unknown>;
		};

		await expect(
			action._handler(
				{ runQuery, runMutation },
				{ operatorActionId: "action_1", messageThreadId: 307 },
			),
		).resolves.toBeNull();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(runMutation).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				operatorActionId: "action_1",
				generatedOutput: "Generated draft",
				generatedOutputSource: "openai_responses",
				generationFailureReason: null,
			}),
		);
		expect(runMutation).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining({
				operatorActionId: "action_1",
				status: "delivery_failed",
				telegramMessageId: null,
				failureReason: expect.stringContaining(
					"Telegram sendMessage failed with status 403",
				),
			}),
		);
	});

	it("normalizes operator id configuration and delivery failure classes", () => {
		expect(parseTelegramSupportOperatorIds("42, 77, nope, 99")).toEqual([
			42, 77, 99,
		]);
		expect(
			classifySupportDeliveryError(
				new Error(
					"Telegram sendMessage failed with status 403: chat not found",
				),
			),
		).toBe("authorization_failed");
		expect(
			classifySupportDeliveryError(new Error("Forbidden: not enough rights")),
		).toBe("topic_permission_failed");
	});
});
