import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { readOptionalConvexEnv, requireConvexEnv } from "./env";
import {
	buildSupportAiDraftFallbackTelegramNote,
	buildSupportAiDraftTelegramNote,
	generateSupportAiDraftText,
	isSupportAiDraftAction,
	normalizeSupportAiDraftFailureReason,
	resolveSupportAiDraftModel,
	type SupportAiDraftRequest,
} from "./support/aiDrafts";
import { buildTelegramDraftDecisionKeyboard } from "./support/operatorActions";
import {
	applyOperatorActionFromTelegramHandler,
	type ApplySupportOperatorActionResult,
	applySupportDraftDecisionFromTelegramHandler,
	type ApplySupportDraftDecisionResult,
	completeOperatorActionAiDraftHandler,
	createSupportDeliveryFailure,
	createVisitorMessageForDeliveryHandler,
	deliverSupportVisitorMessage,
	failOperatorActionAiDraftHandler,
	getFailedVisitorMessageForRecoveryHandler,
	getSupportOperationsSnapshotHandler,
	getOperatorActionAiDraftContextHandler,
	getThreadByConversationCapabilityHandler,
	getThreadBySessionHandler,
	issueVisitorConversationCapabilityHandler,
	markOperatorActionNoteDeliveryHandler,
	markSupportThreadTelegramTopicCleanupHandler,
	markThreadTelegramHeaderHandler,
	markThreadTelegramTopicHandler,
	markVisitorMessageRetryAttemptedHandler,
	markVisitorMessageDeliveredHandler,
	markVisitorMessageFailedHandler,
	recordOperatorReplyHandler,
	runSupportRetentionDatabaseMaintenanceHandler,
	normalizeSupportAttachmentMetadata,
	validateSupportAttachmentUploadRequest,
	type CreateVisitorMessageResult,
	type FailedMessageForRecovery,
	type SupportConversationCapability,
	type SupportMessageAttachment,
	type SupportRetentionMaintenanceResult,
	type SupportOperatorAiDraftContext,
	type SupportThreadState,
} from "./support/model";
import {
	answerTelegramSupportCallbackQuery,
	deleteTelegramSupportTopic,
	parseTelegramSupportOperatorIds,
	parseTelegramSupportUpdate,
	sendTelegramSupportMessage,
} from "./support/telegram";
import {
	supportOperationsSnapshotValidator,
	supportOperatorActionResultValidator,
	supportDraftDecisionResultValidator,
	supportAiDraftActionTypeValidator,
	supportDeliveryFailureClassValidator,
	supportGeneratedOutputSourceValidator,
	supportThreadStateValidator,
	telegramSupportWebhookResultValidator,
} from "./support/validators";

type TelegramSupportWebhookResult = {
	ok: boolean;
	ignored: boolean;
	reason: string | null;
};

const createVisitorMessageResultValidator = v.union(
	v.object({
		kind: v.literal("support_disabled"),
		state: supportThreadStateValidator,
	}),
	v.object({
		kind: v.literal("created"),
		messageId: v.id("supportMessages"),
		threadId: v.id("supportThreads"),
		supportId: v.string(),
		messageText: v.string(),
		attachment: v.union(
			v.object({
				kind: v.literal("screenshot"),
				storageId: v.id("_storage"),
				fileName: v.string(),
				contentType: v.string(),
				size: v.number(),
			}),
			v.null(),
		),
		entrySurface: v.string(),
		pagePath: v.string(),
		telegramMessageThreadId: v.union(v.number(), v.null()),
		telegramHeaderMessageId: v.union(v.number(), v.null()),
		state: supportThreadStateValidator,
	}),
);

const failedVisitorMessageForRecoveryValidator = v.union(
	v.object({
		messageId: v.id("supportMessages"),
		threadId: v.id("supportThreads"),
		supportId: v.string(),
		messageText: v.string(),
		attachment: v.union(
			v.object({
				kind: v.literal("screenshot"),
				storageId: v.id("_storage"),
				fileName: v.string(),
				contentType: v.string(),
				size: v.number(),
			}),
			v.null(),
		),
		deliveryAttemptCount: v.number(),
		entrySurface: v.string(),
		pagePath: v.string(),
		telegramMessageThreadId: v.union(v.number(), v.null()),
		telegramHeaderMessageId: v.union(v.number(), v.null()),
	}),
	v.null(),
);

const supportTelegramTopicCleanupValidator = v.object({
	threadId: v.id("supportThreads"),
	supportId: v.string(),
	messageThreadId: v.number(),
});

const supportRetentionMaintenanceResultValidator = v.object({
	idleClosedThreadCount: v.number(),
	purgedThreadCount: v.number(),
	purgedMessageBodyCount: v.number(),
	purgedGeneratedOutputCount: v.number(),
	deletedRateLimitBucketCount: v.number(),
	telegramTopicCleanups: v.array(supportTelegramTopicCleanupValidator),
});

const supportConversationCapabilityValidator = v.union(
	v.object({
		capabilityToken: v.string(),
		expiresAt: v.number(),
	}),
	v.null(),
);

const supportActionMessageContextValidator = v.object({
	id: v.id("supportMessages"),
	source: v.union(
		v.literal("visitor"),
		v.literal("operator"),
		v.literal("system"),
	),
	body: v.union(v.string(), v.null()),
	createdAt: v.number(),
});

const supportOperatorAiDraftContextValidator = v.union(
	v.object({
		operatorActionId: v.id("supportOperatorActions"),
		actionType: supportAiDraftActionTypeValidator,
		fallbackOutput: v.string(),
		threadContext: v.object({
			supportId: v.string(),
			entrySurface: v.string(),
			pagePath: v.string(),
			visitorKind: v.union(v.literal("anonymous"), v.literal("signed_in")),
			leadStatus: v.union(v.literal("standard"), v.literal("hot")),
			createdAt: v.number(),
			messages: v.array(supportActionMessageContextValidator),
		}),
	}),
	v.null(),
);

const publicVisitorMessageArgs = {
	sessionToken: v.string(),
	messageText: v.string(),
	pagePath: v.string(),
	entrySurface: v.string(),
	attachment: v.optional(
		v.union(
			v.object({
				kind: v.literal("screenshot"),
				storageId: v.id("_storage"),
				fileName: v.string(),
				contentType: v.string(),
				size: v.number(),
			}),
			v.null(),
		),
	),
};

const internalVisitorMessageArgs = {
	...publicVisitorMessageArgs,
	clerkUserId: v.optional(v.union(v.string(), v.null())),
};

export const getThreadBySession = query({
	args: {
		sessionToken: v.string(),
	},
	returns: supportThreadStateValidator,
	handler: getThreadBySessionHandler,
});

export const issueVisitorConversationCapability = mutation({
	args: {
		sessionToken: v.string(),
	},
	returns: supportConversationCapabilityValidator,
	handler: async (ctx, args): Promise<SupportConversationCapability | null> =>
		await issueVisitorConversationCapabilityHandler(ctx, args),
});

export const getThreadByConversationCapability = query({
	args: {
		capabilityToken: v.string(),
	},
	returns: supportThreadStateValidator,
	handler: getThreadByConversationCapabilityHandler,
});

export const generateVisitorAttachmentUploadUrl = mutation({
	args: {
		sessionToken: v.string(),
		fileName: v.string(),
		contentType: v.string(),
		size: v.number(),
	},
	returns: v.string(),
	handler: async (ctx, args) => {
		await validateSupportAttachmentUploadRequest(ctx, args);
		return await ctx.storage.generateUploadUrl();
	},
});

export const recordAdminRecoveryTokenAttempt = internalMutation({
	args: {
		accepted: v.boolean(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const now = Date.now();
		const rateLimitHour = Math.floor(now / (60 * 60 * 1_000));
		const bucketKey = `support-admin-recovery:global:${rateLimitHour}`;
		const existing = await ctx.db
			.query("supportRateLimitBuckets")
			.withIndex("by_bucket_key", (query) => query.eq("bucketKey", bucketKey))
			.unique();
		if (existing && existing.messageCount >= 5 && !args.accepted) {
			throw new Error("Too many support recovery attempts.");
		}
		if (existing) {
			await ctx.db.patch(existing._id, {
				messageCount: existing.messageCount + (args.accepted ? 0 : 1),
				updatedAt: now,
			});
			return null;
		}
		await ctx.db.insert("supportRateLimitBuckets", {
			bucketKey,
			windowStartedAt: rateLimitHour * 60 * 60 * 1_000,
			messageCount: args.accepted ? 0 : 1,
			updatedAt: now,
		});
		return null;
	},
});

export const sendVisitorMessage = action({
	args: publicVisitorMessageArgs,
	returns: supportThreadStateValidator,
	handler: async (ctx, args): Promise<SupportThreadState> => {
		const identity = await ctx.auth.getUserIdentity();
		const attachment = args.attachment
			? await loadSupportMessageAttachment(ctx, args.attachment)
			: null;
		const result: CreateVisitorMessageResult = await ctx.runMutation(
			internal.support.createVisitorMessageForDelivery,
			{
				...args,
				attachment,
				clerkUserId: identity?.subject ?? null,
			},
		);

		if (result.kind === "support_disabled") {
			return result.state;
		}

		let telegramResult: { messageThreadId: number; messageId: number };
		try {
			telegramResult = await deliverSupportVisitorMessage({
				threadId: result.threadId,
				supportId: result.supportId,
				messageText: result.messageText,
				attachment: result.attachment
					? {
							...result.attachment,
							url: await getSupportAttachmentUrl(ctx, result.attachment),
						}
					: null,
				entrySurface: result.entrySurface,
				pagePath: result.pagePath,
				telegramMessageThreadId: result.telegramMessageThreadId,
				telegramHeaderMessageId: result.telegramHeaderMessageId,
				markThreadTelegramTopic: async (topicArgs) =>
					await ctx.runMutation(
						internal.support.markThreadTelegramTopic,
						topicArgs,
					),
				markThreadTelegramHeader: async (headerArgs) =>
					await ctx.runMutation(
						internal.support.markThreadTelegramHeader,
						headerArgs,
					),
			});
		} catch (error) {
			const deliveryFailure = createSupportDeliveryFailure(error);
			const state: SupportThreadState = await ctx.runMutation(
				internal.support.markVisitorMessageFailed,
				{
					messageId: result.messageId,
					threadId: result.threadId,
					...deliveryFailure,
				},
			);
			return state;
		}

		const state: SupportThreadState = await ctx.runMutation(
			internal.support.markVisitorMessageDelivered,
			{
				messageId: result.messageId,
				threadId: result.threadId,
				telegramMessageThreadId: telegramResult.messageThreadId,
				telegramMessageId: telegramResult.messageId,
			},
		);
		return state;
	},
});

export const createVisitorMessageForDelivery = internalMutation({
	args: internalVisitorMessageArgs,
	returns: createVisitorMessageResultValidator,
	handler: createVisitorMessageForDeliveryHandler,
});

export const markVisitorMessageDelivered = internalMutation({
	args: {
		messageId: v.id("supportMessages"),
		threadId: v.id("supportThreads"),
		telegramMessageThreadId: v.number(),
		telegramMessageId: v.number(),
	},
	returns: supportThreadStateValidator,
	handler: markVisitorMessageDeliveredHandler,
});

export const markVisitorMessageFailed = internalMutation({
	args: {
		messageId: v.id("supportMessages"),
		threadId: v.id("supportThreads"),
		errorMessage: v.string(),
		deliveryFailureClass: supportDeliveryFailureClassValidator,
	},
	returns: supportThreadStateValidator,
	handler: markVisitorMessageFailedHandler,
});

export const markThreadTelegramTopic = internalMutation({
	args: {
		threadId: v.id("supportThreads"),
		telegramMessageThreadId: v.number(),
	},
	returns: v.null(),
	handler: markThreadTelegramTopicHandler,
});

export const markThreadTelegramHeader = internalMutation({
	args: {
		threadId: v.id("supportThreads"),
		telegramHeaderMessageId: v.number(),
	},
	returns: v.null(),
	handler: markThreadTelegramHeaderHandler,
});

export const recordOperatorReply = internalMutation({
	args: {
		updateId: v.number(),
		chatId: v.string(),
		messageThreadId: v.number(),
		telegramMessageId: v.number(),
		operatorTelegramUserId: v.number(),
		text: v.string(),
	},
	returns: telegramSupportWebhookResultValidator,
	handler: recordOperatorReplyHandler,
});

export const applyOperatorActionFromTelegram = internalMutation({
	args: {
		updateId: v.number(),
		callbackQueryId: v.string(),
		chatId: v.string(),
		messageThreadId: v.number(),
		operatorTelegramUserId: v.number(),
		supportId: v.string(),
		actionType: v.union(
			v.literal("ask_how_found"),
			v.literal("ask_what_building"),
			v.literal("close_thread"),
			v.literal("ask_for_email"),
			v.literal("ask_for_context"),
			v.literal("send_pricing_link"),
			v.literal("send_checkout_link"),
			v.literal("draft_reply"),
			v.literal("summarize_lead"),
			v.literal("generate_codex_prompt"),
			v.literal("create_linear_draft"),
			v.literal("mark_hot_lead"),
		),
	},
	returns: supportOperatorActionResultValidator,
	handler: applyOperatorActionFromTelegramHandler,
});

export const applySupportDraftDecisionFromTelegram = internalMutation({
	args: {
		updateId: v.number(),
		callbackQueryId: v.string(),
		chatId: v.string(),
		messageThreadId: v.number(),
		operatorTelegramUserId: v.number(),
		operatorActionId: v.id("supportOperatorActions"),
		decision: v.union(v.literal("send"), v.literal("discard")),
	},
	returns: supportDraftDecisionResultValidator,
	handler: applySupportDraftDecisionFromTelegramHandler,
});

export const getOperatorActionAiDraftContext = internalQuery({
	args: {
		operatorActionId: v.id("supportOperatorActions"),
	},
	returns: supportOperatorAiDraftContextValidator,
	handler: getOperatorActionAiDraftContextHandler,
});

export const completeOperatorActionAiDraft = internalMutation({
	args: {
		operatorActionId: v.id("supportOperatorActions"),
		generatedOutput: v.string(),
		generatedOutputSource: supportGeneratedOutputSourceValidator,
		generatedOutputModel: v.union(v.string(), v.null()),
		generationFailureReason: v.union(v.string(), v.null()),
	},
	returns: v.null(),
	handler: completeOperatorActionAiDraftHandler,
});

export const failOperatorActionAiDraft = internalMutation({
	args: {
		operatorActionId: v.id("supportOperatorActions"),
		failureReason: v.string(),
	},
	returns: v.null(),
	handler: failOperatorActionAiDraftHandler,
});

export const markOperatorActionNoteDelivery = internalMutation({
	args: {
		operatorActionId: v.id("supportOperatorActions"),
		status: v.union(v.literal("delivered"), v.literal("delivery_failed")),
		telegramMessageId: v.union(v.number(), v.null()),
		failureReason: v.union(v.string(), v.null()),
	},
	returns: v.null(),
	handler: markOperatorActionNoteDeliveryHandler,
});

export const generateSupportOperatorAiDraft = internalAction({
	args: {
		operatorActionId: v.id("supportOperatorActions"),
		messageThreadId: v.number(),
	},
	returns: v.null(),
	handler: generateSupportOperatorAiDraftHandler,
});

export async function generateSupportOperatorAiDraftHandler(
	ctx: ActionCtx,
	args: {
		operatorActionId: Id<"supportOperatorActions">;
		messageThreadId: number;
	},
) {
	const draftContext: SupportOperatorAiDraftContext | null = await ctx.runQuery(
		internal.support.getOperatorActionAiDraftContext,
		{
			operatorActionId: args.operatorActionId,
		},
	);
	if (!draftContext) {
		await ctx.runMutation(internal.support.failOperatorActionAiDraft, {
			operatorActionId: args.operatorActionId,
			failureReason:
				"AI draft context unavailable; the support thread may be closed or purged.",
		});
		return null;
	}

	const model = resolveSupportAiDraftModel(
		readOptionalConvexEnv("SUPPORT_AI_DRAFT_MODEL"),
	);

	let operatorNoteText: string;
	try {
		const draftRequest: SupportAiDraftRequest = draftContext;
		const generatedOutput = await generateSupportAiDraftText({
			apiKey: requireConvexEnv("OPENAI_API_KEY"),
			model,
			request: draftRequest,
		});
		await ctx.runMutation(internal.support.completeOperatorActionAiDraft, {
			operatorActionId: args.operatorActionId,
			generatedOutput,
			generatedOutputSource: "openai_responses",
			generatedOutputModel: model,
			generationFailureReason: null,
		});
		operatorNoteText = buildSupportAiDraftTelegramNote({
			actionType: draftContext.actionType,
			generatedOutput,
			model,
		});
	} catch (error) {
		const failureReason = normalizeSupportAiDraftFailureReason(error);
		await ctx.runMutation(internal.support.completeOperatorActionAiDraft, {
			operatorActionId: args.operatorActionId,
			generatedOutput: draftContext.fallbackOutput,
			generatedOutputSource: "deterministic",
			generatedOutputModel: model,
			generationFailureReason: failureReason,
		});
		operatorNoteText = buildSupportAiDraftFallbackTelegramNote({
			actionType: draftContext.actionType,
			fallbackOutput: draftContext.fallbackOutput,
			failureReason,
		});
	}

	const noteDelivery = await sendTelegramOperatorNote({
		messageThreadId: args.messageThreadId,
		text: operatorNoteText,
		replyMarkup:
			draftContext.actionType === "draft_reply"
				? buildTelegramDraftDecisionKeyboard(draftContext.operatorActionId)
				: undefined,
	});
	await ctx.runMutation(internal.support.markOperatorActionNoteDelivery, {
		operatorActionId: args.operatorActionId,
		...noteDelivery,
	});

	return null;
}

export const getFailedVisitorMessageForRecovery = internalQuery({
	args: {
		messageId: v.id("supportMessages"),
	},
	returns: failedVisitorMessageForRecoveryValidator,
	handler: getFailedVisitorMessageForRecoveryHandler,
});

export const markVisitorMessageRetryAttempted = internalMutation({
	args: {
		messageId: v.id("supportMessages"),
	},
	returns: failedVisitorMessageForRecoveryValidator,
	handler: markVisitorMessageRetryAttemptedHandler,
});

export const runSupportRetentionDatabaseMaintenance = internalMutation({
	args: {
		now: v.optional(v.number()),
	},
	returns: supportRetentionMaintenanceResultValidator,
	handler: runSupportRetentionDatabaseMaintenanceHandler,
});

export const markSupportThreadTelegramTopicCleanup = internalMutation({
	args: {
		threadId: v.id("supportThreads"),
		status: v.union(v.literal("completed"), v.literal("failed")),
		failureReason: v.union(v.string(), v.null()),
	},
	returns: v.null(),
	handler: markSupportThreadTelegramTopicCleanupHandler,
});

export const getSupportOperationsSnapshot = internalQuery({
	args: {
		now: v.optional(v.number()),
	},
	returns: supportOperationsSnapshotValidator,
	handler: getSupportOperationsSnapshotHandler,
});

export const runSupportRetentionMaintenance = internalAction({
	args: {},
	returns: supportRetentionMaintenanceResultValidator,
	handler: async (ctx): Promise<SupportRetentionMaintenanceResult> => {
		const result: SupportRetentionMaintenanceResult = await ctx.runMutation(
			internal.support.runSupportRetentionDatabaseMaintenance,
			{},
		);
		let completedTopicCleanupCount = 0;
		let failedTopicCleanupCount = 0;

		for (const topicCleanup of result.telegramTopicCleanups) {
			try {
				await deleteTelegramSupportTopic(topicCleanup.messageThreadId);
				await ctx.runMutation(
					internal.support.markSupportThreadTelegramTopicCleanup,
					{
						threadId: topicCleanup.threadId,
						status: "completed",
						failureReason: null,
					},
				);
				completedTopicCleanupCount += 1;
			} catch (error) {
				const deliveryFailure = createSupportDeliveryFailure(error);
				await ctx.runMutation(
					internal.support.markSupportThreadTelegramTopicCleanup,
					{
						threadId: topicCleanup.threadId,
						status: "failed",
						failureReason: deliveryFailure.errorMessage,
					},
				);
				failedTopicCleanupCount += 1;
			}
		}

		return {
			...result,
			telegramTopicCleanups: result.telegramTopicCleanups.slice(
				0,
				completedTopicCleanupCount + failedTopicCleanupCount,
			),
		};
	},
});

export const processTelegramSupportWebhookUpdate = internalAction({
	args: {
		payload: v.any(),
	},
	returns: telegramSupportWebhookResultValidator,
	handler: async (ctx, args): Promise<TelegramSupportWebhookResult> => {
		const supportChatId = readOptionalConvexEnv("TELEGRAM_SUPPORT_CHAT_ID");
		if (!supportChatId) {
			return {
				ok: true,
				ignored: true,
				reason: "missing_support_chat_config",
			};
		}
		const rawOperatorUserIds = readOptionalConvexEnv(
			"TELEGRAM_SUPPORT_OPERATOR_USER_IDS",
		);
		if (!rawOperatorUserIds) {
			return {
				ok: true,
				ignored: true,
				reason: "missing_operator_config",
			};
		}
		const operatorUserIds = parseTelegramSupportOperatorIds(rawOperatorUserIds);
		if (operatorUserIds.length === 0) {
			return {
				ok: true,
				ignored: true,
				reason: "missing_operator_config",
			};
		}

		const update = parseTelegramSupportUpdate(
			args.payload,
			operatorUserIds,
			supportChatId,
		);
		if (update.kind === "ignored") {
			if (update.callbackQueryId) {
				await answerTelegramCallback(
					update.callbackQueryId,
					update.callbackAnswerText ?? "Action unavailable.",
				);
			}
			return { ok: true, ignored: true, reason: update.reason };
		}

		if (update.kind === "operator_message") {
			const { kind: _kind, ...operatorReply } = update;
			const result: TelegramSupportWebhookResult = await ctx.runMutation(
				internal.support.recordOperatorReply,
				operatorReply,
			);
			return result;
		}

		if (update.kind === "draft_decision") {
			const { kind: _kind, ...draftDecision } = update;
			const result: ApplySupportDraftDecisionResult = await ctx.runMutation(
				internal.support.applySupportDraftDecisionFromTelegram,
				draftDecision,
			);
			await answerTelegramCallback(
				update.callbackQueryId,
				result.callbackAnswerText,
			);
			return {
				ok: result.ok,
				ignored: result.ignored,
				reason: result.reason,
			};
		}

		const { kind: _kind, ...operatorAction } = update;
		const actionResult: ApplySupportOperatorActionResult =
			await ctx.runMutation(
				internal.support.applyOperatorActionFromTelegram,
				operatorAction,
			);
		await answerTelegramCallback(
			update.callbackQueryId,
			actionResult.callbackAnswerText,
		);
		if (
			actionResult.aiDraftSchedulingStatus === "scheduling_failed" &&
			actionResult.operatorActionId &&
			actionResult.operatorNoteText &&
			isSupportAiDraftAction(update.actionType)
		) {
			const noteDelivery = await sendTelegramOperatorNote({
				messageThreadId: update.messageThreadId,
				replyMarkup:
					update.actionType === "draft_reply"
						? buildTelegramDraftDecisionKeyboard(actionResult.operatorActionId)
						: undefined,
				text: buildSupportAiDraftFallbackTelegramNote({
					actionType: update.actionType,
					fallbackOutput: actionResult.operatorNoteText,
					failureReason:
						actionResult.aiDraftSchedulingFailureReason ??
						"AI draft scheduling failed.",
				}),
			});
			await ctx.runMutation(internal.support.markOperatorActionNoteDelivery, {
				operatorActionId: actionResult.operatorActionId,
				...noteDelivery,
			});
		} else if (actionResult.operatorNoteText && !actionResult.ignored) {
			const noteDelivery = await sendTelegramOperatorNote({
				messageThreadId: update.messageThreadId,
				text: actionResult.operatorNoteText,
			});
			if (actionResult.operatorActionId) {
				await ctx.runMutation(internal.support.markOperatorActionNoteDelivery, {
					operatorActionId: actionResult.operatorActionId,
					...noteDelivery,
				});
			}
		}

		return {
			ok: actionResult.ok,
			ignored: actionResult.ignored,
			reason: actionResult.reason,
		};
	},
});

export async function retryFailedSupportVisitorMessage(
	ctx: ActionCtx,
	messageId: Id<"supportMessages">,
): Promise<SupportThreadState> {
	const failedMessage: FailedMessageForRecovery | null = await ctx.runMutation(
		internal.support.markVisitorMessageRetryAttempted,
		{ messageId },
	);
	if (!failedMessage) {
		throw new Error("Support message is not eligible for recovery.");
	}

	let telegramResult: { messageThreadId: number; messageId: number };
	try {
		telegramResult = await deliverSupportVisitorMessage({
			threadId: failedMessage.threadId,
			supportId: failedMessage.supportId,
			messageText: failedMessage.messageText,
			attachment: failedMessage.attachment
				? {
						...failedMessage.attachment,
						url: await getSupportAttachmentUrl(ctx, failedMessage.attachment),
					}
				: null,
			entrySurface: failedMessage.entrySurface,
			pagePath: failedMessage.pagePath,
			telegramMessageThreadId: failedMessage.telegramMessageThreadId,
			telegramHeaderMessageId: failedMessage.telegramHeaderMessageId,
			markThreadTelegramTopic: async (topicArgs) =>
				await ctx.runMutation(
					internal.support.markThreadTelegramTopic,
					topicArgs,
				),
			markThreadTelegramHeader: async (headerArgs) =>
				await ctx.runMutation(
					internal.support.markThreadTelegramHeader,
					headerArgs,
				),
		});
	} catch (error) {
		const deliveryFailure = createSupportDeliveryFailure(error);
		return (await ctx.runMutation(internal.support.markVisitorMessageFailed, {
			messageId: failedMessage.messageId,
			threadId: failedMessage.threadId,
			...deliveryFailure,
		})) as SupportThreadState;
	}

	return (await ctx.runMutation(internal.support.markVisitorMessageDelivered, {
		messageId: failedMessage.messageId,
		threadId: failedMessage.threadId,
		telegramMessageThreadId: telegramResult.messageThreadId,
		telegramMessageId: telegramResult.messageId,
	})) as SupportThreadState;
}

async function loadSupportMessageAttachment(
	ctx: ActionCtx,
	input: {
		kind: "screenshot";
		storageId: Id<"_storage">;
		fileName: string;
		contentType: string;
		size: number;
	},
): Promise<SupportMessageAttachment> {
	const blob = await ctx.storage.get(input.storageId);
	if (!blob) {
		throw new Error("Support screenshot upload was not found.");
	}

	const normalized = normalizeSupportAttachmentMetadata({
		storageId: input.storageId,
		fileName: input.fileName,
		contentType: blob.type || input.contentType,
		size: blob.size,
	});

	return {
		...normalized,
		storageId: input.storageId,
	};
}

async function getSupportAttachmentUrl(
	ctx: ActionCtx,
	attachment: SupportMessageAttachment,
) {
	const attachmentUrl = await ctx.storage.getUrl(attachment.storageId);
	if (!attachmentUrl) {
		throw new Error("Support screenshot upload was not found.");
	}

	return attachmentUrl;
}

async function answerTelegramCallback(
	callbackQueryId: string,
	text: string | null,
) {
	try {
		await answerTelegramSupportCallbackQuery(
			callbackQueryId,
			text ?? "Action saved.",
		);
	} catch (error) {
		console.error("telegram support callback acknowledgement failed", error);
	}
}

async function sendTelegramOperatorNote({
	messageThreadId,
	replyMarkup,
	text,
}: {
	messageThreadId: number;
	replyMarkup?: unknown;
	text: string;
}): Promise<{
	status: "delivered" | "delivery_failed";
	telegramMessageId: number | null;
	failureReason: string | null;
}> {
	try {
		const result = await sendTelegramSupportMessage({
			messageThreadId,
			replyMarkup,
			text,
		});
		return {
			status: "delivered",
			telegramMessageId: result.messageId,
			failureReason: null,
		};
	} catch (error) {
		const deliveryFailure = createSupportDeliveryFailure(error);
		console.error("telegram support operator note failed", error);
		return {
			status: "delivery_failed",
			telegramMessageId: null,
			failureReason: deliveryFailure.errorMessage,
		};
	}
}
