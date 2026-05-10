import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("convex support model", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("hashes support session tokens before lookup or storage", async () => {
		const { createSupportSessionTokenHash } =
			await import("@/convex/support/model");
		const token = "a".repeat(64);

		const tokenHash = await createSupportSessionTokenHash(token);

		expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
		expect(tokenHash).not.toBe(token);
	});

	it("rejects short support session tokens", async () => {
		const { createSupportSessionTokenHash } =
			await import("@/convex/support/model");

		await expect(createSupportSessionTokenHash("short")).rejects.toThrow(
			"Support session token is too short.",
		);
	});

	it("normalizes support message text at the boundary", async () => {
		const { normalizeSupportMessageText } =
			await import("@/convex/support/model");

		expect(normalizeSupportMessageText("  hello \n world  ")).toBe(
			"hello\n world",
		);
		expect(() => normalizeSupportMessageText("   ")).toThrow(
			"Support message text is required.",
		);
	});

	it("validates screenshot attachment metadata at the boundary", async () => {
		const { normalizeSupportAttachmentMetadata } =
			await import("@/convex/support/model");

		expect(
			normalizeSupportAttachmentMetadata({
				storageId: "storage_123" as never,
				fileName: " checkout stall.png ",
				contentType: "image/png",
				size: 1234,
			}),
		).toMatchObject({
			kind: "screenshot",
			fileName: "checkout stall.png",
			contentType: "image/png",
			size: 1234,
		});
		expect(() =>
			normalizeSupportAttachmentMetadata({
				fileName: "trace.txt",
				contentType: "text/plain",
				size: 1234,
			}),
		).toThrow("Support screenshot must be a PNG, JPG, or WebP image.");
		expect(() =>
			normalizeSupportAttachmentMetadata({
				fileName: "huge.png",
				contentType: "image/png",
				size: 11 * 1024 * 1024,
			}),
		).toThrow("Support screenshot must be 10 MB or smaller.");
	});

	it("adds first-thread website acknowledgements after the visitor message", async () => {
		const { createVisitorMessageForDeliveryHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
			id: string;
		}> = [];
		const fakeCtx = createFirstVisitorMessageContext(
			inserted,
		) as unknown as Parameters<
			typeof createVisitorMessageForDeliveryHandler
		>[0];

		const state = await createVisitorMessageForDeliveryHandler(fakeCtx, {
			sessionToken: "a".repeat(64),
			messageText: "Can this help me launch?",
			pagePath: "/",
			entrySurface: "homepage_support_widget",
			clerkUserId: null,
		});

		const insertedMessages = inserted.filter(
			(record) => record.table === "supportMessages",
		);
		expect(insertedMessages.map((record) => record.document.source)).toEqual([
			"visitor",
			"system",
			"system",
		]);
		expect(insertedMessages.map((record) => record.document.body)).toEqual([
			"Can this help me launch?",
			"Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.",
			"Parker usually catches these pretty quickly when he's near his phone.",
		]);
		expect(state.state.messages.map((message) => message.body)).toEqual([
			"Can this help me launch?",
			"Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.",
			"Parker usually catches these pretty quickly when he's near his phone.",
		]);
	});

	it("returns the disabled support state when no existing thread is found", async () => {
		process.env.SUPPORT_CHAT_DISABLED = "true";
		const { getThreadBySessionHandler } =
			await import("@/convex/support/model");
		const unique = vi.fn().mockResolvedValue(null);
		const fakeCtx = {
			db: {
				query: vi.fn(() => ({
					withIndex: vi.fn(() => ({ unique })),
				})),
			},
		} as unknown as Parameters<typeof getThreadBySessionHandler>[0];

		await expect(
			getThreadBySessionHandler(fakeCtx, {
				sessionToken: "a".repeat(64),
			}),
		).resolves.toMatchObject({
			status: "disabled",
			messages: [],
			error: "Ship by Sunday support is using Telegram directly right now.",
		});
	});

	it("returns the latest closed thread for the support session", async () => {
		const { getThreadBySessionHandler } =
			await import("@/convex/support/model");
		const orderMock = vi.fn(() => ({
			take: vi.fn().mockResolvedValueOnce([
				{
					_id: "thread_1",
					status: "closed",
					supportId: "SBS-0506-1234",
					purgeAfter: Date.now() + 1_000,
				},
			]),
		}));
		const messageOrderMock = vi.fn(() => ({
			take: vi.fn().mockResolvedValueOnce([
				createSupportMessage({
					id: "message_2",
					body: "Closed reply",
					at: 2,
				}),
				createSupportMessage({ id: "message_1", body: "Question", at: 1 }),
			]),
		}));
		const fakeCtx = createSequencedQueryContext([
			{ unique: async () => ({ _id: "visitor_1" }) },
			{ unique: async () => null },
			{ order: orderMock },
			{ order: messageOrderMock },
		]) as unknown as Parameters<typeof getThreadBySessionHandler>[0];

		const state = await getThreadBySessionHandler(fakeCtx, {
			sessionToken: "a".repeat(64),
		});

		expect(state).toMatchObject({
			status: "closed",
			supportId: "SBS-0506-1234",
		});
		expect(state.messages.map((message) => message.body)).toEqual([
			"Question",
			"Closed reply",
		]);
		expect(orderMock).toHaveBeenCalledWith("desc");
		expect(messageOrderMock).toHaveBeenCalledWith("desc");
	});

	it("ignores purged closed threads for the support session", async () => {
		const { getThreadBySessionHandler } =
			await import("@/convex/support/model");
		const closedThreadOrderMock = vi.fn(() => ({
			take: vi.fn().mockResolvedValueOnce([
				{
					_id: "thread_purged",
					status: "closed",
					supportId: "SBS-0506-9999",
					purgedAt: Date.now() - 1,
					purgeAfter: undefined,
				},
			]),
		}));
		const fakeCtx = createSequencedQueryContext([
			{ unique: async () => ({ _id: "visitor_1" }) },
			{ unique: async () => null },
			{ order: closedThreadOrderMock },
		]) as unknown as Parameters<typeof getThreadBySessionHandler>[0];

		await expect(
			getThreadBySessionHandler(fakeCtx, {
				sessionToken: "a".repeat(64),
			}),
		).resolves.toMatchObject({
			status: "empty",
			messages: [],
		});
	});

	it("does not create a fresh thread when the current session thread is closed", async () => {
		const { createVisitorMessageForDeliveryHandler } =
			await import("@/convex/support/model");
		const insertMock = vi.fn();
		const fakeCtx = {
			...createSequencedQueryContext([
				{
					unique: async () => ({
						_id: "visitor_1",
						visitorKind: "anonymous",
						clerkUserId: undefined,
					}),
				},
				{ unique: async () => null },
				{
					order: () => ({
						take: async () => [
							{
								_id: "thread_1",
								visitorId: "visitor_1",
								status: "closed",
								supportId: "SBS-0506-1234",
								pendingVisitorMessageCount: 0,
								purgeAfter: Date.now() + 1_000,
							},
						],
					}),
				},
			]),
			db: {
				...createSequencedQueryContext([
					{
						unique: async () => ({
							_id: "visitor_1",
							visitorKind: "anonymous",
							clerkUserId: undefined,
						}),
					},
					{ unique: async () => null },
					{
						order: () => ({
							take: async () => [
								{
									_id: "thread_1",
									visitorId: "visitor_1",
									status: "closed",
									supportId: "SBS-0506-1234",
									pendingVisitorMessageCount: 0,
									purgeAfter: Date.now() + 1_000,
								},
							],
						}),
					},
				]).db,
				patch: vi.fn(),
				insert: insertMock,
			},
		} as unknown as Parameters<
			typeof createVisitorMessageForDeliveryHandler
		>[0];

		await expect(
			createVisitorMessageForDeliveryHandler(fakeCtx, {
				sessionToken: "a".repeat(64),
				messageText: "Can I ask another thing?",
				pagePath: "/",
				entrySurface: "homepage_support_widget",
				clerkUserId: null,
			}),
		).rejects.toThrow("Support thread is closed.");
		expect(insertMock).not.toHaveBeenCalled();
	});

	it("applies customer-visible Telegram operator actions once", async () => {
		const { applyOperatorActionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const thread = {
			_id: "thread_1",
			visitorId: "visitor_1",
			supportId: "SBS-0506-1234",
			status: "open",
			entrySurface: "homepage_support_widget",
			pagePath: "/",
			leadStatus: "standard",
			createdAt: 1,
		};
		const visitor = {
			_id: "visitor_1",
			visitorKind: "anonymous",
		};
		const messages = [
			{
				_id: "message_1",
				threadId: "thread_1",
				visitorId: "visitor_1",
				source: "visitor",
				body: "Can this help my SaaS?",
				createdAt: 2,
			},
		];
		const fakeCtx = createOperatorActionContext({
			thread,
			visitor,
			messages,
			existingAction: null,
			inserted,
			patches,
		}) as unknown as Parameters<
			typeof applyOperatorActionFromTelegramHandler
		>[0];

		const result = await applyOperatorActionFromTelegramHandler(fakeCtx, {
			updateId: 101,
			callbackQueryId: "callback_1",
			chatId: "-100123",
			messageThreadId: 300,
			operatorTelegramUserId: 42,
			supportId: "SBS-0506-1234",
			actionType: "ask_for_email",
		});

		expect(result).toMatchObject({
			ok: true,
			ignored: false,
			callbackAnswerText: "Sent email ask.",
		});
		expect(inserted).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					table: "supportMessages",
					document: expect.objectContaining({
						source: "operator",
						body: expect.stringContaining("best email"),
					}),
				}),
				expect.objectContaining({
					table: "supportOperatorActions",
					document: expect.objectContaining({
						actionType: "ask_for_email",
						status: "completed",
						sourceMessageId: "message_1",
						customerVisibleMessageId: "supportMessages_inserted",
					}),
				}),
			]),
		);
		expect(patches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "thread_1",
					patch: expect.objectContaining({ pendingVisitorMessageCount: 0 }),
				}),
			]),
		);
	});

	it("ignores duplicate Telegram operator callbacks without repeating side effects", async () => {
		const { applyOperatorActionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const fakeCtx = createOperatorActionContext({
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				supportId: "SBS-0506-1234",
				status: "open",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				leadStatus: "standard",
				createdAt: 1,
			},
			visitor: { _id: "visitor_1", visitorKind: "anonymous" },
			messages: [],
			existingAction: { _id: "action_1" },
			inserted,
			patches: [],
		}) as unknown as Parameters<
			typeof applyOperatorActionFromTelegramHandler
		>[0];

		await expect(
			applyOperatorActionFromTelegramHandler(fakeCtx, {
				updateId: 101,
				callbackQueryId: "callback_1",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				supportId: "SBS-0506-1234",
				actionType: "ask_for_email",
			}),
		).resolves.toMatchObject({
			ignored: true,
			reason: "duplicate_action",
		});
		expect(inserted).toEqual([]);
	});

	it("re-drives a legacy stranded AI draft duplicate without repeating side effects", async () => {
		const { applyOperatorActionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const scheduler = {
			runAfter: vi.fn().mockResolvedValue("scheduled_legacy"),
		};
		const fakeCtx = createOperatorActionContext({
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				supportId: "SBS-0506-1234",
				status: "open",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				leadStatus: "standard",
				createdAt: 1,
			},
			visitor: { _id: "visitor_1", visitorKind: "anonymous" },
			messages: [],
			existingAction: {
				_id: "action_1",
				status: "completed",
				actionType: "draft_reply",
				generatedOutput: "Deterministic fallback draft",
				generatedOutputSource: "deterministic",
				generationFailureReason: undefined,
				aiDraftGenerationStatus: undefined,
			},
			inserted,
			patches,
			scheduler,
		}) as unknown as Parameters<
			typeof applyOperatorActionFromTelegramHandler
		>[0];

		await expect(
			applyOperatorActionFromTelegramHandler(fakeCtx, {
				updateId: 101,
				callbackQueryId: "callback_1",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				supportId: "SBS-0506-1234",
				actionType: "draft_reply",
			}),
		).resolves.toMatchObject({
			ignored: false,
			operatorActionId: "action_1",
			aiDraftSchedulingStatus: "scheduled",
		});
		expect(inserted).toEqual([]);
		expect(scheduler.runAfter).toHaveBeenCalledWith(0, expect.anything(), {
			operatorActionId: "action_1",
			messageThreadId: 300,
		});
		expect(patches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "action_1",
					patch: expect.objectContaining({
						aiDraftGenerationStatus: "scheduled",
					}),
				}),
			]),
		);
	});

	it("builds operator-only drafts from the latest thread messages", async () => {
		const { applyOperatorActionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const scheduler = {
			runAfter: vi.fn().mockResolvedValue("scheduled_1"),
		};
		const fakeCtx = createOperatorActionContext({
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				supportId: "SBS-0506-1234",
				status: "open",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				leadStatus: "standard",
				createdAt: 1,
			},
			visitor: { _id: "visitor_1", visitorKind: "anonymous" },
			messages: [
				createSupportMessage({
					id: "message_new",
					body: "Latest blocker is the checkout redirect.",
					at: 60,
				}),
				createSupportMessage({
					id: "message_old",
					body: "Old blocker was styling.",
					at: 10,
				}),
			],
			existingAction: null,
			inserted,
			patches: [],
			scheduler,
		}) as unknown as Parameters<
			typeof applyOperatorActionFromTelegramHandler
		>[0];

		const result = await applyOperatorActionFromTelegramHandler(fakeCtx, {
			updateId: 101,
			callbackQueryId: "callback_1",
			chatId: "-100123",
			messageThreadId: 300,
			operatorTelegramUserId: 42,
			supportId: "SBS-0506-1234",
			actionType: "draft_reply",
		});

		expect(result).toMatchObject({
			ok: true,
			ignored: false,
			callbackAnswerText: "Generating AI draft.",
			operatorActionId: "supportOperatorActions_inserted",
			operatorNoteText: null,
			aiDraftSchedulingStatus: "scheduled",
		});
		expect(scheduler.runAfter).toHaveBeenCalledWith(0, expect.anything(), {
			operatorActionId: "supportOperatorActions_inserted",
			messageThreadId: 300,
		});
		expect(inserted).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					table: "supportOperatorActions",
					document: expect.objectContaining({
						actionType: "draft_reply",
						aiDraftGenerationStatus: "scheduled",
						operatorNoteDeliveryStatus: "pending",
						generatedOutputSource: "deterministic",
						generatedOutput: expect.stringContaining(
							"Latest blocker is the checkout redirect.",
						),
					}),
				}),
			]),
		);
		expect(
			inserted.find((record) => record.table === "supportMessages"),
		).toBeUndefined();
	});

	it("keeps deterministic fallback metadata when AI scheduling fails", async () => {
		const { applyOperatorActionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const scheduler = {
			runAfter: vi.fn().mockRejectedValue(new Error("scheduler unavailable")),
		};
		const fakeCtx = createOperatorActionContext({
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				supportId: "SBS-0506-1234",
				status: "open",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				leadStatus: "standard",
				createdAt: 1,
			},
			visitor: { _id: "visitor_1", visitorKind: "anonymous" },
			messages: [
				createSupportMessage({
					id: "message_new",
					body: "Checkout redirect is blocked.",
					at: 60,
				}),
			],
			existingAction: null,
			inserted,
			patches,
			scheduler,
		}) as unknown as Parameters<
			typeof applyOperatorActionFromTelegramHandler
		>[0];

		await expect(
			applyOperatorActionFromTelegramHandler(fakeCtx, {
				updateId: 101,
				callbackQueryId: "callback_1",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				supportId: "SBS-0506-1234",
				actionType: "draft_reply",
			}),
		).resolves.toMatchObject({
			callbackAnswerText: "AI draft fallback saved.",
			operatorActionId: "supportOperatorActions_inserted",
			operatorNoteText: expect.stringContaining("Checkout redirect"),
			aiDraftSchedulingStatus: "scheduling_failed",
			aiDraftSchedulingFailureReason: expect.stringContaining(
				"scheduler unavailable",
			),
		});
		expect(patches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "supportOperatorActions_inserted",
					patch: expect.objectContaining({
						aiDraftGenerationStatus: "failed",
						generationFailureReason: expect.stringContaining(
							"scheduler unavailable",
						),
					}),
				}),
			]),
		);
	});

	it("sends a completed draft to the visitor exactly once", async () => {
		const { applySupportDraftDecisionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = createDraftDecisionContext({
			action: {
				_id: "action_1",
				threadId: "thread_1",
				actionType: "draft_reply",
				status: "completed",
				aiDraftGenerationStatus: "completed",
				generatedOutput: "Yooo - what are you trying to make?",
			},
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				status: "open",
				telegramChatId: "-100123",
				telegramMessageThreadId: 300,
			},
			inserted,
			patches,
		}) as unknown as Parameters<
			typeof applySupportDraftDecisionFromTelegramHandler
		>[0];

		await expect(
			applySupportDraftDecisionFromTelegramHandler(fakeCtx, {
				updateId: 111,
				callbackQueryId: "callback_send_draft",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				operatorActionId: "action_1",
				decision: "send",
			}),
		).resolves.toMatchObject({
			ok: true,
			ignored: false,
			callbackAnswerText: "Sent draft.",
		});
		expect(inserted).toEqual([
			expect.objectContaining({
				table: "supportMessages",
				document: expect.objectContaining({
					source: "operator",
					body: "Yooo - what are you trying to make?",
					telegramUpdateId: 111,
				}),
			}),
		]);
		expect(patches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "thread_1",
					patch: expect.objectContaining({
						pendingVisitorMessageCount: 0,
					}),
				}),
				expect.objectContaining({
					id: "action_1",
					patch: expect.objectContaining({
						customerVisibleMessageId: "supportMessages_inserted",
						draftDecisionStatus: "sent",
						draftDecisionTelegramUpdateId: 111,
					}),
				}),
			]),
		);
	});

	it("does not send discarded or already sent drafts", async () => {
		const { applySupportDraftDecisionFromTelegramHandler } =
			await import("@/convex/support/model");
		const inserted: Array<{
			table: string;
			document: Record<string, unknown>;
		}> = [];
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = createDraftDecisionContext({
			action: {
				_id: "action_1",
				threadId: "thread_1",
				actionType: "draft_reply",
				status: "completed",
				aiDraftGenerationStatus: "completed",
				generatedOutput: "Draft body",
			},
			thread: {
				_id: "thread_1",
				visitorId: "visitor_1",
				status: "open",
				telegramChatId: "-100123",
				telegramMessageThreadId: 300,
			},
			inserted,
			patches,
		}) as unknown as Parameters<
			typeof applySupportDraftDecisionFromTelegramHandler
		>[0];

		await expect(
			applySupportDraftDecisionFromTelegramHandler(fakeCtx, {
				updateId: 112,
				callbackQueryId: "callback_discard_draft",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				operatorActionId: "action_1",
				decision: "discard",
			}),
		).resolves.toMatchObject({
			ok: true,
			ignored: false,
			callbackAnswerText: "Draft discarded.",
		});
		await expect(
			applySupportDraftDecisionFromTelegramHandler(fakeCtx, {
				updateId: 113,
				callbackQueryId: "callback_send_after_discard",
				chatId: "-100123",
				messageThreadId: 300,
				operatorTelegramUserId: 42,
				operatorActionId: "action_1",
				decision: "send",
			}),
		).resolves.toMatchObject({
			ignored: true,
			reason: "draft_discarded",
		});
		expect(inserted).toEqual([]);
		expect(patches).toEqual([
			expect.objectContaining({
				id: "action_1",
				patch: expect.objectContaining({
					draftDecisionStatus: "discarded",
					draftDecisionTelegramUpdateId: 112,
				}),
			}),
		]);
	});

	it("loads AI draft context from the latest bounded thread messages", async () => {
		const { getOperatorActionAiDraftContextHandler } =
			await import("@/convex/support/model");
		const action = {
			_id: "action_1",
			threadId: "thread_1",
			actionType: "summarize_lead",
			status: "completed",
			generatedOutput: "Fallback summary",
		};
		const thread = {
			_id: "thread_1",
			visitorId: "visitor_1",
			supportId: "SBS-0506-1234",
			status: "open",
			entrySurface: "homepage_support_widget",
			pagePath: "/",
			leadStatus: "hot",
			createdAt: 1,
		};
		const visitor = {
			_id: "visitor_1",
			visitorKind: "signed_in",
		};
		const orderMock = vi.fn(() => ({
			take: vi.fn().mockResolvedValueOnce([
				createSupportMessage({
					id: "message_new",
					body: "New ask about codebase review.",
					at: 60,
				}),
				createSupportMessage({
					id: "message_old",
					body: "Old ask about pricing.",
					at: 10,
				}),
			]),
		}));
		const fakeCtx = {
			db: {
				get: vi.fn(async (id: string) => {
					if (id === "action_1") {
						return action;
					}
					if (id === "thread_1") {
						return thread;
					}
					if (id === "visitor_1") {
						return visitor;
					}
					return null;
				}),
				query: vi.fn(() => ({
					withIndex: vi.fn(() => ({ order: orderMock })),
				})),
			},
		} as unknown as Parameters<
			typeof getOperatorActionAiDraftContextHandler
		>[0];

		const context = await getOperatorActionAiDraftContextHandler(fakeCtx, {
			operatorActionId: "action_1",
		});

		expect(context).toMatchObject({
			operatorActionId: "action_1",
			actionType: "summarize_lead",
			fallbackOutput: "Fallback summary",
			threadContext: {
				supportId: "SBS-0506-1234",
				visitorKind: "signed_in",
				leadStatus: "hot",
			},
		});
		expect(
			context?.threadContext.messages.map((message) => message.body),
		).toEqual(["Old ask about pricing.", "New ask about codebase review."]);
		expect(orderMock).toHaveBeenCalledWith("desc");
	});

	it("marks scheduled AI drafts failed when thread context is gone", async () => {
		const { failOperatorActionAiDraftHandler } =
			await import("@/convex/support/model");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = {
			db: {
				patch: async (id: string, patch: Record<string, unknown>) => {
					patches.push({ id, patch });
				},
			},
		} as unknown as Parameters<typeof failOperatorActionAiDraftHandler>[0];

		await expect(
			failOperatorActionAiDraftHandler(fakeCtx, {
				operatorActionId: "action_scheduled",
				failureReason:
					"AI draft context unavailable; the support thread may be closed or purged.",
			}),
		).resolves.toBeNull();

		expect(patches).toEqual([
			{
				id: "action_scheduled",
				patch: {
					aiDraftGenerationStatus: "failed",
					generationFailureReason:
						"AI draft context unavailable; the support thread may be closed or purged.",
					operatorNoteDeliveryStatus: "delivery_failed",
					operatorNoteDeliveryFailureReason:
						"AI draft context unavailable; the support thread may be closed or purged.",
				},
			},
		]);
	});

	it("fails scheduled AI drafts when the generation action cannot load context", async () => {
		const { generateSupportOperatorAiDraftHandler } =
			await import("@/convex/support");
		const runMutation = vi.fn(async () => null);
		const fakeCtx = {
			runQuery: vi.fn(async () => null),
			runMutation,
		} as unknown as Parameters<typeof generateSupportOperatorAiDraftHandler>[0];

		await expect(
			generateSupportOperatorAiDraftHandler(fakeCtx, {
				operatorActionId: "action_scheduled",
				messageThreadId: 300,
			}),
		).resolves.toBeNull();

		expect(runMutation).toHaveBeenCalledOnce();
		expect(runMutation.mock.calls[0]?.[1]).toEqual({
			operatorActionId: "action_scheduled",
			failureReason:
				"AI draft context unavailable; the support thread may be closed or purged.",
		});
	});

	it("closes idle anonymous threads and purges expired transcripts", async () => {
		const { runSupportRetentionDatabaseMaintenanceHandler } =
			await import("@/convex/support/model");
		const now = Date.parse("2026-05-06T12:00:00.000Z");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const deletedIds: string[] = [];
		const fakeCtx = createRetentionMaintenanceContext({
			idleThreads: [
				{
					_id: "thread_idle_anonymous",
					visitorId: "visitor_anonymous",
					status: "open",
					supportId: "SBS-0506-1111",
					idleCloseAfter: now - 1,
				},
				{
					_id: "thread_idle_signed_in",
					visitorId: "visitor_signed_in",
					status: "open",
					supportId: "SBS-0506-2222",
					idleCloseAfter: now - 1,
				},
			],
			purgeThreads: [
				{
					_id: "thread_purge",
					visitorId: "visitor_anonymous",
					status: "closed",
					supportId: "SBS-0506-3333",
					purgeAfter: now - 1,
					telegramMessageThreadId: 777,
				},
			],
			messages: [
				{
					_id: "message_secret",
					threadId: "thread_purge",
					body: "secret transcript",
				},
			],
			operatorActions: [
				{
					_id: "action_secret",
					threadId: "thread_purge",
					generatedOutput: "private generated output",
				},
			],
			rateLimitBuckets: [{ _id: "bucket_old" }],
			patches,
			deletedIds,
		}) as unknown as Parameters<
			typeof runSupportRetentionDatabaseMaintenanceHandler
		>[0];

		const result = await runSupportRetentionDatabaseMaintenanceHandler(
			fakeCtx,
			{
				now,
			},
		);

		expect(result).toMatchObject({
			idleClosedThreadCount: 1,
			purgedThreadCount: 1,
			purgedMessageBodyCount: 1,
			purgedGeneratedOutputCount: 1,
			deletedRateLimitBucketCount: 1,
			telegramTopicCleanups: [
				{
					threadId: "thread_purge",
					supportId: "SBS-0506-3333",
					messageThreadId: 777,
				},
			],
		});
		expect(patches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "thread_idle_anonymous",
					patch: expect.objectContaining({
						status: "closed",
						closedAt: now,
					}),
				}),
				expect.objectContaining({
					id: "thread_idle_signed_in",
					patch: expect.objectContaining({
						idleCloseAfter: now + 14 * 24 * 60 * 60 * 1_000,
					}),
				}),
				expect.objectContaining({
					id: "message_secret",
					patch: { body: undefined, bodyPurgedAt: now },
				}),
				expect.objectContaining({
					id: "action_secret",
					patch: {
						generatedOutput: undefined,
						generatedOutputPurgedAt: now,
					},
				}),
				expect.objectContaining({
					id: "thread_purge",
					patch: expect.objectContaining({
						purgedAt: now,
						purgeAfter: undefined,
						telegramTopicCleanupStatus: "pending",
					}),
				}),
			]),
		);
		expect(deletedIds).toEqual(["bucket_old"]);
	});

	it("retries failed Telegram topic cleanups after transcript purge", async () => {
		const { runSupportRetentionDatabaseMaintenanceHandler } =
			await import("@/convex/support/model");
		const now = Date.parse("2026-05-06T12:00:00.000Z");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const deletedIds: string[] = [];
		const fakeCtx = createRetentionMaintenanceContext({
			idleThreads: [],
			purgeThreads: [],
			messages: [],
			operatorActions: [],
			rateLimitBuckets: [],
			pendingTopicCleanups: [
				{
					_id: "thread_cleanup_pending",
					supportId: "SBS-0506-3333",
					telegramMessageThreadId: 777,
				},
			],
			failedTopicCleanups: [
				{
					_id: "thread_cleanup_failed",
					supportId: "SBS-0506-4444",
					telegramMessageThreadId: 888,
					telegramTopicCleanupStatus: "failed",
				},
			],
			patches,
			deletedIds,
		}) as unknown as Parameters<
			typeof runSupportRetentionDatabaseMaintenanceHandler
		>[0];

		await expect(
			runSupportRetentionDatabaseMaintenanceHandler(fakeCtx, { now }),
		).resolves.toMatchObject({
			telegramTopicCleanups: [
				{
					threadId: "thread_cleanup_pending",
					supportId: "SBS-0506-3333",
					messageThreadId: 777,
				},
				{
					threadId: "thread_cleanup_failed",
					supportId: "SBS-0506-4444",
					messageThreadId: 888,
				},
			],
		});
		expect(patches).toEqual([]);
		expect(deletedIds).toEqual([]);
	});

	it("applies retry eligibility before recording a manual retry attempt", async () => {
		const { markVisitorMessageRetryAttemptedHandler } =
			await import("@/convex/support/model");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = createRetryEligibilityContext({
			message: {
				_id: "message_failed",
				threadId: "thread_1",
				source: "visitor",
				body: "Can Parker see this?",
				deliveryStatus: "delivery_failed",
				deliveryAttemptCount: 1,
				deliveryFailureClass: "network_error",
			},
			thread: {
				_id: "thread_1",
				status: "open",
				supportId: "SBS-0506-1234",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				telegramMessageThreadId: 300,
			},
			patches,
		}) as unknown as Parameters<
			typeof markVisitorMessageRetryAttemptedHandler
		>[0];

		await expect(
			markVisitorMessageRetryAttemptedHandler(fakeCtx, {
				messageId: "message_failed",
			}),
		).resolves.toMatchObject({
			messageId: "message_failed",
			deliveryAttemptCount: 2,
			messageText: "Can Parker see this?",
		});
		expect(patches).toEqual([
			{
				id: "message_failed",
				patch: expect.objectContaining({
					deliveryStatus: "sending",
					deliveryAttemptCount: 2,
					lastDeliveryError: undefined,
					deliveryFailureClass: undefined,
				}),
			},
		]);
	});

	it("does not retry a message already claimed for delivery", async () => {
		const { markVisitorMessageRetryAttemptedHandler } =
			await import("@/convex/support/model");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = createRetryEligibilityContext({
			message: {
				_id: "message_sending",
				threadId: "thread_1",
				source: "visitor",
				body: "Can Parker see this?",
				deliveryStatus: "sending",
				deliveryAttemptCount: 2,
				deliveryFailureClass: undefined,
			},
			thread: {
				_id: "thread_1",
				status: "open",
				supportId: "SBS-0506-1234",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
			},
			patches,
		}) as unknown as Parameters<
			typeof markVisitorMessageRetryAttemptedHandler
		>[0];

		await expect(
			markVisitorMessageRetryAttemptedHandler(fakeCtx, {
				messageId: "message_sending",
			}),
		).resolves.toBeNull();
		expect(patches).toEqual([]);
	});

	it("rejects non-retryable support delivery failures", async () => {
		const { markVisitorMessageRetryAttemptedHandler } =
			await import("@/convex/support/model");
		const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
		const fakeCtx = createRetryEligibilityContext({
			message: {
				_id: "message_failed",
				threadId: "thread_1",
				source: "visitor",
				body: "Bad payload",
				deliveryStatus: "delivery_failed",
				deliveryAttemptCount: 1,
				deliveryFailureClass: "content_rejected",
			},
			thread: {
				_id: "thread_1",
				status: "open",
				supportId: "SBS-0506-1234",
			},
			patches,
		}) as unknown as Parameters<
			typeof markVisitorMessageRetryAttemptedHandler
		>[0];

		await expect(
			markVisitorMessageRetryAttemptedHandler(fakeCtx, {
				messageId: "message_failed",
			}),
		).resolves.toBeNull();
		expect(patches).toEqual([]);
	});

	it("builds a support operations snapshot without transcript text", async () => {
		const { getSupportOperationsSnapshotHandler } =
			await import("@/convex/support/model");
		const now = Date.parse("2026-05-06T12:00:00.000Z");
		const fakeCtx = createOperationsSnapshotContext({
			failedMessages: [
				{
					_id: "message_failed",
					threadId: "thread_1",
					source: "visitor",
					body: "private transcript text",
					deliveryStatus: "delivery_failed",
					deliveryAttemptCount: 2,
					lastDeliveryAttemptAt: now - 100,
					deliveryFailureClass: "network_error",
				},
			],
			failedActions: [
				{
					_id: "action_failed",
					threadId: "thread_1",
					actionType: "draft_reply",
					operatorNoteDeliveryFailureReason: "provider unavailable",
					generatedOutput: "private generated output",
					createdAt: now - 50,
				},
			],
			idleThreads: [
				{
					_id: "thread_idle",
					visitorId: "visitor_anonymous",
					supportId: "SBS-0506-9999",
					idleCloseAfter: now - 1,
				},
			],
			purgeThreads: [
				{
					_id: "thread_purge",
					supportId: "SBS-0506-7777",
					purgeAfter: now - 1,
				},
			],
			cleanupFailures: [
				{
					_id: "thread_cleanup_failed",
					supportId: "SBS-0506-8888",
					telegramTopicCleanupFailureReason: "not enough rights",
					telegramTopicCleanupAttemptedAt: now - 25,
				},
			],
		}) as unknown as Parameters<typeof getSupportOperationsSnapshotHandler>[0];

		const snapshot = await getSupportOperationsSnapshotHandler(fakeCtx, {
			now,
		});
		const serializedSnapshot = JSON.stringify(snapshot);

		expect(snapshot.failedVisitorMessages).toEqual([
			expect.objectContaining({
				messageId: "message_failed",
				supportId: "SBS-0506-1234",
				retryEligible: true,
			}),
		]);
		expect(snapshot.operatorNoteDeliveryFailures).toEqual([
			expect.objectContaining({
				operatorActionId: "action_failed",
				supportId: "SBS-0506-1234",
				actionType: "draft_reply",
			}),
		]);
		expect(serializedSnapshot).not.toContain("private transcript text");
		expect(serializedSnapshot).not.toContain("private generated output");
	});

	it("formats Telegram topic labels from the support entry surface", async () => {
		const { formatSupportTelegramEntryLabel } =
			await import("@/convex/support/model");

		expect(formatSupportTelegramEntryLabel("homepage_support_widget")).toBe(
			"homepage",
		);
		expect(formatSupportTelegramEntryLabel("workspace_support_widget")).toBe(
			"workspace",
		);
		expect(formatSupportTelegramEntryLabel("custom surface/value")).toBe(
			"custom_surface_value",
		);
	});
});

function createFirstVisitorMessageContext(
	inserted: Array<{
		table: string;
		document: Record<string, unknown>;
		id: string;
	}>,
) {
	let visitor: Record<string, unknown> | null = null;
	let thread: Record<string, unknown> | null = null;
	let supportMessageCount = 0;

	return {
		db: {
			query: (table: string) => ({
				withIndex: (indexName: string) => {
					if (
						table === "supportVisitors" &&
						indexName === "by_session_token_hash"
					) {
						return { unique: async () => null };
					}
					if (
						table === "supportThreads" &&
						indexName === "by_visitor_id_and_status"
					) {
						return {
							unique: async () => null,
							order: () => ({ take: async () => [] }),
						};
					}
					if (
						table === "supportRateLimitBuckets" &&
						indexName === "by_bucket_key"
					) {
						return { unique: async () => null };
					}
					if (
						table === "supportMessages" &&
						indexName === "by_thread_id_and_created_at"
					) {
						return {
							order: () => ({
								take: async () =>
									inserted
										.filter((record) => record.table === "supportMessages")
										.map((record) => ({
											_id: record.id,
											...record.document,
										}))
										.sort(
											(left, right) =>
												Number(right.createdAt) - Number(left.createdAt),
										),
							}),
						};
					}
					throw new Error(`Unexpected query: ${table}.${indexName}`);
				},
			}),
			get: async (id: string) => {
				if (visitor?._id === id) {
					return visitor;
				}
				if (thread?._id === id) {
					return thread;
				}
				return null;
			},
			insert: async (table: string, document: Record<string, unknown>) => {
				const id =
					table === "supportMessages"
						? `message_${(supportMessageCount += 1)}`
						: `${table}_inserted`;
				inserted.push({ table, document, id });
				if (table === "supportVisitors") {
					visitor = { _id: id, visitorKind: "anonymous", ...document };
				}
				if (table === "supportThreads") {
					thread = { _id: id, ...document };
				}
				return id;
			},
			patch: async (id: string, patch: Record<string, unknown>) => {
				if (thread?._id === id) {
					thread = { ...thread, ...patch };
				}
			},
		},
	};
}

function createSupportMessage({
	id,
	body,
	at,
}: {
	id: string;
	body: string;
	at: number;
}) {
	return {
		_id: id,
		threadId: "thread_1",
		visitorId: "visitor_1",
		source: "visitor",
		body,
		createdAt: at,
		deliveryStatus: "delivered_to_parker",
		deliveryFailureClass: undefined,
	};
}

function createDraftDecisionContext({
	action,
	thread,
	inserted,
	patches,
}: {
	action: Record<string, unknown>;
	thread: Record<string, unknown>;
	inserted: Array<{ table: string; document: Record<string, unknown> }>;
	patches: Array<{ id: string; patch: Record<string, unknown> }>;
}) {
	let currentAction = { ...action };
	let currentThread = { ...thread };
	return {
		db: {
			query: (table: string) => ({
				withIndex: (indexName: string) => {
					if (
						table === "supportOperatorActions" &&
						indexName === "by_telegram_callback_query_id"
					) {
						return { unique: async () => null };
					}
					throw new Error(`Unexpected query: ${table}.${indexName}`);
				},
			}),
			get: async (id: string) => {
				if (id === currentAction._id) {
					return currentAction;
				}
				if (id === currentThread._id) {
					return currentThread;
				}
				return null;
			},
			insert: async (table: string, document: Record<string, unknown>) => {
				inserted.push({ table, document });
				return `${table}_inserted`;
			},
			patch: async (id: string, patch: Record<string, unknown>) => {
				patches.push({ id, patch });
				if (id === currentAction._id) {
					currentAction = { ...currentAction, ...patch };
				}
				if (id === currentThread._id) {
					currentThread = { ...currentThread, ...patch };
				}
			},
		},
	};
}

function createSequencedQueryContext(
	results: Array<{
		unique?: () => Promise<unknown>;
		order?: (direction: "asc" | "desc") => {
			take: (limit: number) => Promise<unknown[]>;
		};
	}>,
) {
	let queryIndex = 0;
	return {
		db: {
			query: vi.fn(() => ({
				withIndex: vi.fn(() => {
					const result = results[queryIndex];
					queryIndex += 1;
					if (!result) {
						throw new Error("Unexpected query.");
					}
					if (result.unique) {
						return { unique: result.unique };
					}
					if (result.order) {
						return { order: result.order };
					}
					throw new Error("Unsupported query result.");
				}),
			})),
		},
	};
}

function createOperatorActionContext({
	thread,
	visitor,
	messages,
	existingAction,
	inserted,
	patches,
	scheduler,
}: {
	thread: Record<string, unknown>;
	visitor: Record<string, unknown>;
	messages: Array<Record<string, unknown>>;
	existingAction: Record<string, unknown> | null;
	inserted: Array<{ table: string; document: Record<string, unknown> }>;
	patches: Array<{ id: string; patch: Record<string, unknown> }>;
	scheduler?: { runAfter: ReturnType<typeof vi.fn> };
}) {
	return {
		scheduler: scheduler ?? { runAfter: vi.fn() },
		db: {
			query: (table: string) => ({
				withIndex: () => {
					if (table === "supportThreads") {
						return { unique: async () => thread };
					}
					if (table === "supportOperatorActions") {
						return { unique: async () => existingAction };
					}
					if (table === "supportMessages") {
						return {
							order: () => ({
								take: async () => messages,
							}),
						};
					}
					throw new Error(`Unexpected table query: ${table}`);
				},
			}),
			get: async (id: string) => (id === visitor._id ? visitor : null),
			insert: async (table: string, document: Record<string, unknown>) => {
				inserted.push({ table, document });
				return `${table}_inserted`;
			},
			patch: async (id: string, patch: Record<string, unknown>) => {
				patches.push({ id, patch });
			},
		},
	};
}

function createRetentionMaintenanceContext({
	idleThreads,
	purgeThreads,
	messages,
	operatorActions,
	rateLimitBuckets,
	pendingTopicCleanups = [],
	failedTopicCleanups = [],
	patches,
	deletedIds,
}: {
	idleThreads: Array<Record<string, unknown>>;
	purgeThreads: Array<Record<string, unknown>>;
	messages: Array<Record<string, unknown>>;
	operatorActions: Array<Record<string, unknown>>;
	rateLimitBuckets: Array<Record<string, unknown>>;
	pendingTopicCleanups?: Array<Record<string, unknown>>;
	failedTopicCleanups?: Array<Record<string, unknown>>;
	patches: Array<{ id: string; patch: Record<string, unknown> }>;
	deletedIds: string[];
}) {
	return {
		db: {
			get: async (id: string) => {
				if (id === "visitor_signed_in") {
					return { _id: id, visitorKind: "signed_in" };
				}
				if (id === "visitor_anonymous") {
					return { _id: id, visitorKind: "anonymous" };
				}
				return null;
			},
			query: (table: string) => ({
				withIndex: (
					indexName: string,
					buildQuery?: (query: {
						eq: (fieldName: string, value: string) => unknown;
					}) => unknown,
				) => {
					if (
						table === "supportThreads" &&
						indexName === "by_status_and_idle_close_after"
					) {
						return { take: async () => idleThreads };
					}
					if (
						table === "supportThreads" &&
						indexName === "by_status_and_purge_after"
					) {
						return { take: async () => purgeThreads };
					}
					if (
						table === "supportThreads" &&
						indexName === "by_telegram_topic_cleanup_status_and_updated_at"
					) {
						let cleanupStatus = "pending";
						buildQuery?.({
							eq: (_fieldName: string, value: string) => {
								cleanupStatus = value;
								return {};
							},
						});
						return {
							take: async () =>
								cleanupStatus === "failed"
									? failedTopicCleanups
									: pendingTopicCleanups,
						};
					}
					if (table === "supportMessages") {
						return {
							order: () => createAsyncRows(messages),
						};
					}
					if (table === "supportOperatorActions") {
						return {
							order: () => createAsyncRows(operatorActions),
						};
					}
					if (table === "supportRateLimitBuckets") {
						return { take: async () => rateLimitBuckets };
					}
					throw new Error(`Unexpected query: ${table}.${indexName}`);
				},
			}),
			patch: async (id: string, patch: Record<string, unknown>) => {
				patches.push({ id, patch });
			},
			delete: async (id: string) => {
				deletedIds.push(id);
			},
		},
	};
}

function createRetryEligibilityContext({
	message,
	thread,
	patches,
}: {
	message: Record<string, unknown>;
	thread: Record<string, unknown>;
	patches: Array<{ id: string; patch: Record<string, unknown> }>;
}) {
	return {
		db: {
			get: async (id: string) => {
				if (id === message._id) {
					return message;
				}
				if (id === thread._id) {
					return thread;
				}
				return null;
			},
			patch: async (id: string, patch: Record<string, unknown>) => {
				patches.push({ id, patch });
			},
		},
	};
}

function createOperationsSnapshotContext({
	failedMessages,
	failedActions,
	idleThreads,
	purgeThreads,
	cleanupFailures,
}: {
	failedMessages: Array<Record<string, unknown>>;
	failedActions: Array<Record<string, unknown>>;
	idleThreads: Array<Record<string, unknown>>;
	purgeThreads: Array<Record<string, unknown>>;
	cleanupFailures: Array<Record<string, unknown>>;
}) {
	const threadsById = new Map<string, Record<string, unknown>>([
		[
			"thread_1",
			{
				_id: "thread_1",
				status: "open",
				supportId: "SBS-0506-1234",
			},
		],
		...idleThreads.map(
			(thread) =>
				[String(thread._id), thread] as [string, Record<string, unknown>],
		),
	]);
	return {
		db: {
			get: async (id: string) => {
				if (id === "visitor_anonymous") {
					return { _id: id, visitorKind: "anonymous" };
				}
				return threadsById.get(id) ?? null;
			},
			query: (table: string) => ({
				withIndex: (indexName: string) => {
					if (
						table === "supportMessages" &&
						indexName === "by_delivery_status_and_created_at"
					) {
						return {
							order: () => ({ take: async () => failedMessages }),
						};
					}
					if (
						table === "supportOperatorActions" &&
						indexName === "by_operator_note_delivery_status_and_created_at"
					) {
						return {
							order: () => ({ take: async () => failedActions }),
						};
					}
					if (
						table === "supportThreads" &&
						indexName === "by_status_and_idle_close_after"
					) {
						return { take: async () => idleThreads };
					}
					if (
						table === "supportThreads" &&
						indexName === "by_status_and_purge_after"
					) {
						return { take: async () => purgeThreads };
					}
					if (
						table === "supportThreads" &&
						indexName === "by_telegram_topic_cleanup_status_and_updated_at"
					) {
						return {
							order: () => ({ take: async () => cleanupFailures }),
						};
					}
					throw new Error(`Unexpected query: ${table}.${indexName}`);
				},
			}),
		},
	};
}

function createAsyncRows(rows: Array<Record<string, unknown>>) {
	return {
		async *[Symbol.asyncIterator]() {
			for (const row of rows) {
				yield row;
			}
		},
	};
}
