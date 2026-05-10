import type { GenericId } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { requireConvexEnv, readOptionalConvexEnv } from "../env";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
	classifySupportDeliveryError,
	createTelegramSupportTopic,
	sendTelegramSupportMessage,
	sendTelegramSupportPhoto,
} from "./telegram";
import {
	formatSupportAttachmentSize,
	isSupportScreenshotContentType,
	normalizeSupportScreenshotFileName,
	SUPPORT_SCREENSHOT_MAX_BYTES,
	type SupportScreenshotContentType,
} from "../../lib/support/support-attachment-policy";
import { normalizeSupportAiDraftFailureReason } from "./aiDrafts";
import {
	buildSupportOperatorActionEffect,
	buildTelegramSupportActionKeyboard,
	isSupportAiDraftActionType,
	type SupportActionThreadContext,
	type SupportAiDraftActionType,
	type SupportDraftDecision,
	type SupportOperatorActionType,
} from "./operatorActions";
import type { SupportDeliveryFailureClass } from "./types";

const SUPPORT_FALLBACK_HREF = "https://t.me/parkerrex";
const SUPPORT_SESSION_HASH_PREFIX = "support-session:";
const SUPPORT_MESSAGE_MAX_LENGTH = 2_000;
const SUPPORT_SEND_COOLDOWN_MS = 2_000;
const SUPPORT_PENDING_VISITOR_MESSAGE_LIMIT = 5;
const SUPPORT_GLOBAL_HOURLY_LIMIT = 60;
const SUPPORT_IDLE_CLOSE_MS = 14 * 24 * 60 * 60 * 1_000;
const SUPPORT_CLOSED_RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;
const SUPPORT_VISITOR_DELIVERY_RETRY_LIMIT = 5;
const SUPPORT_RETENTION_THREAD_BATCH_SIZE = 20;
const SUPPORT_TRANSCRIPT_PURGE_WRITE_LIMIT = 100;
const SUPPORT_RATE_BUCKET_RETENTION_MS = 48 * 60 * 60 * 1_000;
const SUPPORT_OPERATIONS_SNAPSHOT_LIMIT = 20;
const SUPPORT_FIRST_MESSAGE_ACKNOWLEDGEMENTS = [
	"Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.",
	"Parker usually catches these pretty quickly when he's near his phone.",
] as const;

type SupportThreadId = GenericId<"supportThreads">;
type SupportMessageId = GenericId<"supportMessages">;
type SupportOperatorActionId = GenericId<"supportOperatorActions">;
type SupportStorageId = GenericId<"_storage">;

export type SupportMessageAttachment = {
	kind: "screenshot";
	storageId: SupportStorageId;
	fileName: string;
	contentType: SupportScreenshotContentType;
	size: number;
};

type SupportMessageAttachmentDelivery = SupportMessageAttachment & {
	url: string;
};

export type SupportThreadState = {
	status: "empty" | "open" | "closed" | "disabled";
	supportId: string | null;
	messages: Array<{
		id: string;
		source: "visitor" | "operator" | "system";
		body: string | null;
		attachment: {
			kind: "screenshot";
			fileName: string;
			contentType: string;
			size: number;
			url: string | null;
		} | null;
		createdAt: number;
		deliveryStatus:
			| "not_required"
			| "sending"
			| "delivered_to_parker"
			| "delivery_failed";
		deliveryFailureClass: SupportDeliveryFailureClass | null;
	}>;
	fallbackHref: string;
	error: string | null;
};

export type CreateVisitorMessageResult =
	| {
			kind: "support_disabled";
			state: SupportThreadState;
	  }
	| {
			kind: "created";
			messageId: SupportMessageId;
			threadId: SupportThreadId;
			supportId: string;
			messageText: string;
			attachment: SupportMessageAttachment | null;
			entrySurface: string;
			pagePath: string;
			telegramMessageThreadId: number | null;
			telegramHeaderMessageId: number | null;
			state: SupportThreadState;
	  };

export type FailedMessageForRecovery = {
	messageId: SupportMessageId;
	threadId: SupportThreadId;
	supportId: string;
	messageText: string;
	attachment: SupportMessageAttachment | null;
	deliveryAttemptCount: number;
	entrySurface: string;
	pagePath: string;
	telegramMessageThreadId: number | null;
	telegramHeaderMessageId: number | null;
};

export type ApplySupportOperatorActionResult = {
	ok: boolean;
	ignored: boolean;
	reason: string | null;
	callbackAnswerText: string | null;
	operatorNoteText: string | null;
	operatorActionId: SupportOperatorActionId | null;
	aiDraftSchedulingStatus: "not_required" | "scheduled" | "scheduling_failed";
	aiDraftSchedulingFailureReason: string | null;
};

export type ApplySupportDraftDecisionResult = {
	ok: boolean;
	ignored: boolean;
	reason: string | null;
	callbackAnswerText: string;
};

export type SupportOperatorAiDraftContext = {
	operatorActionId: SupportOperatorActionId;
	actionType: SupportAiDraftActionType;
	fallbackOutput: string;
	threadContext: SupportActionThreadContext;
};

export type SupportTelegramTopicCleanup = {
	threadId: SupportThreadId;
	supportId: string;
	messageThreadId: number;
};

export type SupportRetentionMaintenanceResult = {
	idleClosedThreadCount: number;
	purgedThreadCount: number;
	purgedMessageBodyCount: number;
	purgedGeneratedOutputCount: number;
	deletedRateLimitBucketCount: number;
	telegramTopicCleanups: SupportTelegramTopicCleanup[];
};

export type SupportOperationsSnapshot = {
	generatedAt: number;
	failedVisitorMessages: Array<{
		messageId: SupportMessageId;
		threadId: SupportThreadId;
		supportId: string;
		deliveryFailureClass: SupportDeliveryFailureClass | null;
		deliveryAttemptCount: number;
		lastDeliveryAttemptAt: number | null;
		retryEligible: boolean;
	}>;
	operatorNoteDeliveryFailures: Array<{
		operatorActionId: SupportOperatorActionId;
		threadId: SupportThreadId;
		supportId: string;
		actionType: SupportOperatorActionType;
		failureReason: string | null;
		createdAt: number;
	}>;
	idleThreadsDueForClose: Array<{
		threadId: SupportThreadId;
		supportId: string;
		visitorKind: "anonymous" | "signed_in";
		idleCloseAfter: number;
	}>;
	transcriptsDueForPurge: Array<{
		threadId: SupportThreadId;
		supportId: string;
		purgeAfter: number;
	}>;
	telegramTopicCleanupFailures: Array<{
		threadId: SupportThreadId;
		supportId: string;
		failureReason: string | null;
		lastAttemptedAt: number | null;
	}>;
};

export async function createSupportSessionTokenHash(sessionToken: string) {
	const normalizedToken = sessionToken.trim();
	if (normalizedToken.length < 32) {
		throw new Error("Support session token is too short.");
	}

	const encoded = new TextEncoder().encode(
		`${SUPPORT_SESSION_HASH_PREFIX}${normalizedToken}`,
	);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
	return [...new Uint8Array(hashBuffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

export function normalizeSupportMessageText(messageText: string) {
	const normalized = messageText.trim().replace(/\s+\n/g, "\n");
	if (!normalized) {
		throw new Error("Support message text is required.");
	}
	if (normalized.length > SUPPORT_MESSAGE_MAX_LENGTH) {
		throw new Error(
			`Support message text must be ${SUPPORT_MESSAGE_MAX_LENGTH} characters or fewer.`,
		);
	}

	return normalized;
}

export function normalizeSupportAttachmentMetadata(input: {
	fileName: string;
	contentType: string;
	size: number;
	storageId?: SupportStorageId;
}): SupportMessageAttachment | Omit<SupportMessageAttachment, "storageId"> {
	const contentType = input.contentType.trim().toLowerCase();
	if (!isSupportScreenshotContentType(contentType)) {
		throw new Error("Support screenshot must be a PNG, JPG, or WebP image.");
	}

	if (
		!Number.isSafeInteger(input.size) ||
		input.size <= 0 ||
		input.size > SUPPORT_SCREENSHOT_MAX_BYTES
	) {
		throw new Error("Support screenshot must be 10 MB or smaller.");
	}

	return {
		kind: "screenshot",
		...(input.storageId ? { storageId: input.storageId } : {}),
		fileName: normalizeSupportScreenshotFileName(input.fileName),
		contentType,
		size: input.size,
	};
}

export async function validateSupportAttachmentUploadRequest(args: {
	sessionToken: string;
	fileName: string;
	contentType: string;
	size: number;
}) {
	if (isSupportChatDisabled()) {
		throw new Error("Support is using Telegram directly right now.");
	}

	await createSupportSessionTokenHash(args.sessionToken);
	normalizeSupportAttachmentMetadata(args);
}

export async function getThreadBySessionHandler(
	ctx: QueryCtx,
	args: {
		sessionToken: string;
	},
): Promise<SupportThreadState> {
	const supportChatDisabled = isSupportChatDisabled();
	const sessionTokenHash = await createSupportSessionTokenHash(
		args.sessionToken,
	);
	const visitor = await findSupportVisitorBySessionTokenHash(
		ctx,
		sessionTokenHash,
	);
	if (!visitor) {
		return supportChatDisabled
			? createDisabledThreadState()
			: createEmptyThreadState();
	}

	const thread = await findCurrentSupportThreadByVisitorId(ctx, visitor._id);
	if (!thread) {
		return supportChatDisabled
			? createDisabledThreadState()
			: createEmptyThreadState();
	}

	return await buildSupportThreadState(ctx, thread);
}

export async function createVisitorMessageForDeliveryHandler(
	ctx: MutationCtx,
	args: {
		sessionToken: string;
		messageText: string;
		pagePath: string;
		entrySurface: string;
		clerkUserId?: string | null;
		attachment?: SupportMessageAttachment | null;
	},
): Promise<CreateVisitorMessageResult> {
	if (isSupportChatDisabled()) {
		return {
			kind: "support_disabled",
			state: createDisabledThreadState(),
		};
	}

	const now = Date.now();
	const messageText = normalizeSupportMessageText(args.messageText);
	const sessionTokenHash = await createSupportSessionTokenHash(
		args.sessionToken,
	);
	const visitor = await getOrCreateSupportVisitor(ctx, {
		sessionTokenHash,
		clerkUserId: args.clerkUserId ?? null,
		pagePath: normalizePagePath(args.pagePath),
		now,
	});
	const { thread, isNewThread } =
		await getOrCreateSupportThreadForVisitorMessage(ctx, {
			visitorId: visitor._id,
			entrySurface: normalizeEntrySurface(args.entrySurface),
			pagePath: normalizePagePath(args.pagePath),
			now,
		});

	assertThreadCanAcceptVisitorMessage(thread, now);
	await assertGlobalHourlyLimit(ctx, now);

	const messageId = await ctx.db.insert("supportMessages", {
		threadId: thread._id,
		visitorId: visitor._id,
		source: "visitor",
		body: messageText,
		attachmentKind: args.attachment?.kind,
		attachmentStorageId: args.attachment?.storageId,
		attachmentFileName: args.attachment?.fileName,
		attachmentContentType: args.attachment?.contentType,
		attachmentSize: args.attachment?.size,
		attachmentPurgedAt: undefined,
		createdAt: now,
		deliveryStatus: "sending",
		deliveryAttemptCount: 1,
		lastDeliveryAttemptAt: now,
		lastDeliveryError: undefined,
		deliveryFailureClass: undefined,
		telegramMessageId: undefined,
		telegramUpdateId: undefined,
		telegramOperatorUserId: undefined,
		bodyPurgedAt: undefined,
	});
	const lastMessageAt = isNewThread
		? await insertFirstMessageAcknowledgements(ctx, {
				threadId: thread._id,
				visitorId: visitor._id,
				now,
			})
		: now;

	await ctx.db.patch(thread._id, {
		updatedAt: lastMessageAt,
		lastMessageAt,
		lastVisitorMessageAt: now,
		pendingVisitorMessageCount: thread.pendingVisitorMessageCount + 1,
	});

	const updatedThread = await requireSupportThread(ctx, thread._id);

	return {
		kind: "created",
		messageId,
		threadId: thread._id,
		supportId: thread.supportId,
		messageText,
		attachment: args.attachment ?? null,
		entrySurface: thread.entrySurface,
		pagePath: thread.pagePath,
		telegramMessageThreadId: updatedThread.telegramMessageThreadId ?? null,
		telegramHeaderMessageId: updatedThread.telegramHeaderMessageId ?? null,
		state: await buildSupportThreadState(ctx, updatedThread),
	};
}

export async function markVisitorMessageDeliveredHandler(
	ctx: MutationCtx,
	args: {
		messageId: SupportMessageId;
		threadId: SupportThreadId;
		telegramMessageThreadId: number;
		telegramMessageId: number;
	},
): Promise<SupportThreadState> {
	const now = Date.now();
	await ctx.db.patch(args.messageId, {
		deliveryStatus: "delivered_to_parker",
		telegramMessageId: args.telegramMessageId,
		lastDeliveryAttemptAt: now,
		lastDeliveryError: undefined,
		deliveryFailureClass: undefined,
	});
	await ctx.db.patch(args.threadId, {
		telegramMessageThreadId: args.telegramMessageThreadId,
		updatedAt: now,
	});

	return await buildSupportThreadState(
		ctx,
		await requireSupportThread(ctx, args.threadId),
	);
}

export async function markVisitorMessageFailedHandler(
	ctx: MutationCtx,
	args: {
		messageId: SupportMessageId;
		threadId: SupportThreadId;
		errorMessage: string;
		deliveryFailureClass: SupportDeliveryFailureClass;
	},
): Promise<SupportThreadState> {
	const now = Date.now();
	await ctx.db.patch(args.messageId, {
		deliveryStatus: "delivery_failed",
		lastDeliveryAttemptAt: now,
		lastDeliveryError: trimProviderError(args.errorMessage),
		deliveryFailureClass: args.deliveryFailureClass,
	});
	await ctx.db.patch(args.threadId, {
		updatedAt: now,
	});

	return await buildSupportThreadState(
		ctx,
		await requireSupportThread(ctx, args.threadId),
	);
}

export async function markVisitorMessageRetryAttemptedHandler(
	ctx: MutationCtx,
	args: { messageId: SupportMessageId },
): Promise<FailedMessageForRecovery | null> {
	const failedMessage = await getFailedVisitorMessageForRecoveryHandler(ctx, {
		messageId: args.messageId,
	});
	if (!failedMessage) {
		return null;
	}

	const nextDeliveryAttemptCount = failedMessage.deliveryAttemptCount + 1;
	await ctx.db.patch(args.messageId, {
		deliveryStatus: "sending",
		deliveryAttemptCount: nextDeliveryAttemptCount,
		lastDeliveryAttemptAt: Date.now(),
		lastDeliveryError: undefined,
		deliveryFailureClass: undefined,
	});

	return {
		...failedMessage,
		deliveryAttemptCount: nextDeliveryAttemptCount,
	};
}

export async function markThreadTelegramTopicHandler(
	ctx: MutationCtx,
	args: {
		threadId: SupportThreadId;
		telegramMessageThreadId: number;
	},
) {
	await ctx.db.patch(args.threadId, {
		telegramChatId: requireConvexEnv("TELEGRAM_SUPPORT_CHAT_ID"),
		telegramMessageThreadId: args.telegramMessageThreadId,
		updatedAt: Date.now(),
	});

	return null;
}

export async function markThreadTelegramHeaderHandler(
	ctx: MutationCtx,
	args: {
		threadId: SupportThreadId;
		telegramHeaderMessageId: number;
	},
) {
	await ctx.db.patch(args.threadId, {
		telegramHeaderMessageId: args.telegramHeaderMessageId,
		updatedAt: Date.now(),
	});

	return null;
}

export async function recordOperatorReplyHandler(
	ctx: MutationCtx,
	args: {
		updateId: number;
		chatId: string;
		messageThreadId: number;
		telegramMessageId: number;
		operatorTelegramUserId: number;
		text: string;
	},
) {
	const thread = await findSupportThreadByTelegramTopic(ctx, {
		chatId: args.chatId,
		messageThreadId: args.messageThreadId,
	});
	if (!thread) {
		return { ok: true, ignored: true, reason: "unmapped_topic" };
	}
	if (thread.status !== "open") {
		return { ok: true, ignored: true, reason: "thread_closed" };
	}

	const existingMessage = await ctx.db
		.query("supportMessages")
		.withIndex("by_thread_id_and_telegram_message_id", (query) =>
			query
				.eq("threadId", thread._id)
				.eq("telegramMessageId", args.telegramMessageId),
		)
		.unique();
	if (existingMessage) {
		return { ok: true, ignored: true, reason: "duplicate_message" };
	}

	const now = Date.now();
	await ctx.db.insert("supportMessages", {
		threadId: thread._id,
		visitorId: thread.visitorId,
		source: "operator",
		body: normalizeSupportMessageText(args.text),
		createdAt: now,
		deliveryStatus: "not_required",
		deliveryAttemptCount: 0,
		lastDeliveryAttemptAt: undefined,
		lastDeliveryError: undefined,
		deliveryFailureClass: undefined,
		telegramMessageId: args.telegramMessageId,
		telegramUpdateId: args.updateId,
		telegramOperatorUserId: args.operatorTelegramUserId,
		bodyPurgedAt: undefined,
	});
	await ctx.db.patch(thread._id, {
		updatedAt: now,
		lastMessageAt: now,
		pendingVisitorMessageCount: 0,
	});

	return { ok: true, ignored: false, reason: null };
}

export async function applyOperatorActionFromTelegramHandler(
	ctx: MutationCtx,
	args: {
		updateId: number;
		callbackQueryId: string;
		chatId: string;
		messageThreadId: number;
		operatorTelegramUserId: number;
		supportId: string;
		actionType: SupportOperatorActionType;
	},
): Promise<ApplySupportOperatorActionResult> {
	const thread = await findSupportThreadByTelegramTopic(ctx, {
		chatId: args.chatId,
		messageThreadId: args.messageThreadId,
	});
	if (!thread) {
		return createIgnoredOperatorActionResult(
			"unmapped_topic",
			"Support thread was not found.",
		);
	}

	const existingAction = await ctx.db
		.query("supportOperatorActions")
		.withIndex("by_telegram_callback_query_id", (query) =>
			query.eq("telegramCallbackQueryId", args.callbackQueryId),
		)
		.unique();
	if (existingAction) {
		const redriveResult = await scheduleStrandedAiDraftFromDuplicateCallback(
			ctx,
			{
				action: existingAction,
				messageThreadId: args.messageThreadId,
			},
		);
		if (redriveResult) {
			return redriveResult;
		}

		return createIgnoredOperatorActionResult(
			"duplicate_action",
			"Action was already handled.",
		);
	}

	if (thread.supportId !== args.supportId) {
		await insertIgnoredOperatorAction(ctx, {
			threadId: thread._id,
			actionType: args.actionType,
			operatorTelegramUserId: args.operatorTelegramUserId,
			telegramCallbackQueryId: args.callbackQueryId,
			telegramUpdateId: args.updateId,
			failureReason: "support_id_mismatch",
		});
		return createIgnoredOperatorActionResult(
			"support_id_mismatch",
			"Action does not match this thread.",
		);
	}

	const now = Date.now();
	const threadMessages = await listRecentThreadMessages(ctx, thread._id);
	const sourceMessageId = findLatestVisitorMessageId(threadMessages);

	if (args.actionType === "close_thread") {
		const alreadyClosed = thread.status === "closed";
		await ctx.db.insert("supportOperatorActions", {
			threadId: thread._id,
			actionType: "close_thread",
			status: alreadyClosed ? "ignored" : "completed",
			operatorTelegramUserId: args.operatorTelegramUserId,
			telegramCallbackQueryId: args.callbackQueryId,
			telegramUpdateId: args.updateId,
			sourceMessageId: sourceMessageId ?? undefined,
			failureReason: alreadyClosed ? "already_closed" : undefined,
			aiDraftGenerationStatus: "not_required",
			operatorNoteDeliveryStatus: "not_required",
			createdAt: now,
			completedAt: alreadyClosed ? undefined : now,
		});

		if (!alreadyClosed) {
			await ctx.db.patch(thread._id, {
				status: "closed",
				updatedAt: now,
				closedAt: now,
				retainUntil: now + SUPPORT_CLOSED_RETENTION_MS,
				purgeAfter: now + SUPPORT_CLOSED_RETENTION_MS,
			});
		}

		return {
			ok: true,
			ignored: alreadyClosed,
			reason: alreadyClosed ? "already_closed" : null,
			callbackAnswerText: alreadyClosed
				? "Thread was already closed."
				: "Thread closed.",
			operatorNoteText: null,
			operatorActionId: null,
			aiDraftSchedulingStatus: "not_required",
			aiDraftSchedulingFailureReason: null,
		};
	}

	if (thread.status !== "open") {
		await insertIgnoredOperatorAction(ctx, {
			threadId: thread._id,
			actionType: args.actionType,
			operatorTelegramUserId: args.operatorTelegramUserId,
			telegramCallbackQueryId: args.callbackQueryId,
			telegramUpdateId: args.updateId,
			sourceMessageId,
			failureReason: "thread_closed",
		});
		return createIgnoredOperatorActionResult(
			"thread_closed",
			"Thread is closed.",
		);
	}

	const visitor = await ctx.db.get(thread.visitorId);
	const effect = buildSupportOperatorActionEffect(args.actionType, {
		supportId: thread.supportId,
		entrySurface: thread.entrySurface,
		pagePath: thread.pagePath,
		visitorKind: visitor?.visitorKind ?? "anonymous",
		leadStatus: thread.leadStatus ?? "standard",
		createdAt: thread.createdAt,
		messages: threadMessages.map((message) => ({
			id: message._id,
			source: message.source,
			body: message.body ?? null,
			createdAt: message.createdAt,
		})),
	} satisfies SupportActionThreadContext);
	let customerVisibleMessageId: SupportMessageId | undefined;

	if (effect.customerMessageText) {
		customerVisibleMessageId = await ctx.db.insert("supportMessages", {
			threadId: thread._id,
			visitorId: thread.visitorId,
			source: "operator",
			body: effect.customerMessageText,
			createdAt: now,
			deliveryStatus: "not_required",
			deliveryAttemptCount: 0,
			lastDeliveryAttemptAt: undefined,
			lastDeliveryError: undefined,
			deliveryFailureClass: undefined,
			telegramMessageId: undefined,
			telegramUpdateId: args.updateId,
			telegramOperatorUserId: args.operatorTelegramUserId,
			bodyPurgedAt: undefined,
		});
		await ctx.db.patch(thread._id, {
			updatedAt: now,
			lastMessageAt: now,
			pendingVisitorMessageCount: 0,
		});
	} else if (args.actionType === "mark_hot_lead") {
		await ctx.db.patch(thread._id, {
			leadStatus: "hot",
			updatedAt: now,
		});
	} else {
		await ctx.db.patch(thread._id, {
			updatedAt: now,
		});
	}

	const shouldGenerateAiDraft = isSupportAiDraftActionType(args.actionType);
	const operatorActionId = await ctx.db.insert("supportOperatorActions", {
		threadId: thread._id,
		actionType: args.actionType,
		status: "completed",
		operatorTelegramUserId: args.operatorTelegramUserId,
		telegramCallbackQueryId: args.callbackQueryId,
		telegramUpdateId: args.updateId,
		sourceMessageId: sourceMessageId ?? undefined,
		customerVisibleMessageId,
		aiDraftGenerationStatus: shouldGenerateAiDraft
			? "scheduled"
			: "not_required",
		generatedOutput: effect.generatedOutput ?? undefined,
		generatedOutputSource: effect.generatedOutput ? "deterministic" : undefined,
		generatedOutputModel: undefined,
		generatedOutputPurgedAt: undefined,
		generationFailureReason: undefined,
		operatorNoteDeliveryStatus: effect.operatorNoteText
			? "pending"
			: "not_required",
		operatorNoteTelegramMessageId: undefined,
		operatorNoteDeliveryFailureReason: undefined,
		failureReason: undefined,
		createdAt: now,
		completedAt: now,
	});
	const schedulingResult = shouldGenerateAiDraft
		? await scheduleSupportOperatorAiDraft(ctx, {
				operatorActionId,
				messageThreadId: args.messageThreadId,
			})
		: { status: "not_required" as const, failureReason: null };
	const operatorNoteText =
		schedulingResult.status === "scheduled" ? null : effect.operatorNoteText;

	return {
		ok: true,
		ignored: false,
		reason: null,
		callbackAnswerText: shouldGenerateAiDraft
			? schedulingResult.status === "scheduled"
				? "Generating AI draft."
				: "AI draft fallback saved."
			: effect.callbackAnswerText,
		operatorNoteText,
		operatorActionId,
		aiDraftSchedulingStatus: schedulingResult.status,
		aiDraftSchedulingFailureReason: schedulingResult.failureReason,
	};
}

export async function applySupportDraftDecisionFromTelegramHandler(
	ctx: MutationCtx,
	args: {
		updateId: number;
		callbackQueryId: string;
		chatId: string;
		messageThreadId: number;
		operatorTelegramUserId: number;
		operatorActionId: SupportOperatorActionId;
		decision: SupportDraftDecision;
	},
): Promise<ApplySupportDraftDecisionResult> {
	const existingCallbackAction = await ctx.db
		.query("supportOperatorActions")
		.withIndex("by_telegram_callback_query_id", (query) =>
			query.eq("telegramCallbackQueryId", args.callbackQueryId),
		)
		.unique();
	if (existingCallbackAction) {
		return createIgnoredDraftDecisionResult(
			"duplicate_action",
			"Action was already handled.",
		);
	}

	const action = await ctx.db.get(args.operatorActionId);
	if (
		!action ||
		action.status !== "completed" ||
		action.actionType !== "draft_reply"
	) {
		return createIgnoredDraftDecisionResult(
			"draft_unavailable",
			"Draft is unavailable.",
		);
	}

	const thread = await ctx.db.get(action.threadId);
	if (
		!thread ||
		thread.telegramChatId !== args.chatId ||
		thread.telegramMessageThreadId !== args.messageThreadId
	) {
		return createIgnoredDraftDecisionResult(
			"unmapped_topic",
			"Support thread was not found.",
		);
	}
	if (thread.status !== "open" || thread.purgedAt) {
		return createIgnoredDraftDecisionResult(
			"thread_closed",
			"Thread is closed.",
		);
	}
	if (
		action.customerVisibleMessageId ||
		action.draftDecisionStatus === "sent"
	) {
		return createIgnoredDraftDecisionResult(
			"draft_already_sent",
			"Draft was already sent.",
		);
	}
	if (action.draftDecisionStatus === "discarded") {
		return createIgnoredDraftDecisionResult(
			"draft_discarded",
			"Draft was already discarded.",
		);
	}

	const now = Date.now();
	if (args.decision === "discard") {
		await ctx.db.patch(action._id, {
			draftDecisionStatus: "discarded",
			draftDecisionAt: now,
			draftDecisionTelegramUpdateId: args.updateId,
		});
		return {
			ok: true,
			ignored: false,
			reason: null,
			callbackAnswerText: "Draft discarded.",
		};
	}

	if (
		!action.generatedOutput ||
		action.generatedOutputPurgedAt ||
		action.aiDraftGenerationStatus === "scheduled"
	) {
		return createIgnoredDraftDecisionResult(
			"draft_unavailable",
			"Draft is unavailable.",
		);
	}

	const customerVisibleMessageId = await ctx.db.insert("supportMessages", {
		threadId: thread._id,
		visitorId: thread.visitorId,
		source: "operator",
		body: normalizeSupportMessageText(action.generatedOutput),
		createdAt: now,
		deliveryStatus: "not_required",
		deliveryAttemptCount: 0,
		lastDeliveryAttemptAt: undefined,
		lastDeliveryError: undefined,
		deliveryFailureClass: undefined,
		telegramMessageId: undefined,
		telegramUpdateId: args.updateId,
		telegramOperatorUserId: args.operatorTelegramUserId,
		bodyPurgedAt: undefined,
	});
	await ctx.db.patch(thread._id, {
		updatedAt: now,
		lastMessageAt: now,
		pendingVisitorMessageCount: 0,
	});
	await ctx.db.patch(action._id, {
		customerVisibleMessageId,
		draftDecisionStatus: "sent",
		draftDecisionAt: now,
		draftDecisionTelegramUpdateId: args.updateId,
	});

	return {
		ok: true,
		ignored: false,
		reason: null,
		callbackAnswerText: "Sent draft.",
	};
}

async function scheduleStrandedAiDraftFromDuplicateCallback(
	ctx: MutationCtx,
	args: {
		action: Doc<"supportOperatorActions">;
		messageThreadId: number;
	},
): Promise<ApplySupportOperatorActionResult | null> {
	const action = args.action;
	if (
		action.status !== "completed" ||
		!isSupportAiDraftActionType(action.actionType) ||
		action.aiDraftGenerationStatus ||
		action.generatedOutputSource !== "deterministic" ||
		action.generationFailureReason
	) {
		return null;
	}

	const schedulingResult = await scheduleSupportOperatorAiDraft(ctx, {
		operatorActionId: action._id,
		messageThreadId: args.messageThreadId,
	});

	return {
		ok: true,
		ignored: false,
		reason: null,
		callbackAnswerText:
			schedulingResult.status === "scheduled"
				? "Generating AI draft."
				: "AI draft fallback saved.",
		operatorNoteText:
			schedulingResult.status === "scheduling_failed"
				? (action.generatedOutput ?? null)
				: null,
		operatorActionId: action._id,
		aiDraftSchedulingStatus: schedulingResult.status,
		aiDraftSchedulingFailureReason: schedulingResult.failureReason,
	};
}

async function scheduleSupportOperatorAiDraft(
	ctx: MutationCtx,
	args: {
		operatorActionId: SupportOperatorActionId;
		messageThreadId: number;
	},
): Promise<
	| { status: "scheduled"; failureReason: null }
	| { status: "scheduling_failed"; failureReason: string }
> {
	try {
		await ctx.scheduler.runAfter(
			0,
			internal.support.generateSupportOperatorAiDraft,
			{
				operatorActionId: args.operatorActionId,
				messageThreadId: args.messageThreadId,
			},
		);
		await ctx.db.patch(args.operatorActionId, {
			aiDraftGenerationStatus: "scheduled",
		});
		return { status: "scheduled", failureReason: null };
	} catch (error) {
		const failureReason = `AI draft scheduling failed: ${normalizeSupportAiDraftFailureReason(error)}`;
		await ctx.db.patch(args.operatorActionId, {
			aiDraftGenerationStatus: "failed",
			generationFailureReason: failureReason,
		});
		return { status: "scheduling_failed", failureReason };
	}
}

export async function getOperatorActionAiDraftContextHandler(
	ctx: QueryCtx,
	args: { operatorActionId: SupportOperatorActionId },
): Promise<SupportOperatorAiDraftContext | null> {
	const action = await ctx.db.get(args.operatorActionId);
	if (
		!action ||
		action.status !== "completed" ||
		!isSupportAiDraftActionType(action.actionType)
	) {
		return null;
	}

	const thread = await ctx.db.get(action.threadId);
	if (!thread || thread.status !== "open") {
		return null;
	}

	const visitor = await ctx.db.get(thread.visitorId);
	const threadMessages = await listRecentThreadMessages(ctx, thread._id);

	return {
		operatorActionId: action._id,
		actionType: action.actionType,
		fallbackOutput: action.generatedOutput ?? "",
		threadContext: {
			supportId: thread.supportId,
			entrySurface: thread.entrySurface,
			pagePath: thread.pagePath,
			visitorKind: visitor?.visitorKind ?? "anonymous",
			leadStatus: thread.leadStatus ?? "standard",
			createdAt: thread.createdAt,
			messages: threadMessages.map((message) => ({
				id: message._id,
				source: message.source,
				body: message.body ?? null,
				createdAt: message.createdAt,
			})),
		},
	};
}

export async function completeOperatorActionAiDraftHandler(
	ctx: MutationCtx,
	args: {
		operatorActionId: SupportOperatorActionId;
		generatedOutput: string;
		generatedOutputSource: "deterministic" | "openai_responses";
		generatedOutputModel: string | null;
		generationFailureReason: string | null;
	},
) {
	await ctx.db.patch(args.operatorActionId, {
		aiDraftGenerationStatus:
			args.generatedOutputSource === "openai_responses"
				? "completed"
				: "failed",
		generatedOutput: args.generatedOutput,
		generatedOutputSource: args.generatedOutputSource,
		generatedOutputModel: args.generatedOutputModel ?? undefined,
		generationFailureReason: args.generationFailureReason ?? undefined,
	});

	return null;
}

export async function failOperatorActionAiDraftHandler(
	ctx: MutationCtx,
	args: {
		operatorActionId: SupportOperatorActionId;
		failureReason: string;
	},
) {
	const failureReason = trimProviderError(args.failureReason);
	await ctx.db.patch(args.operatorActionId, {
		aiDraftGenerationStatus: "failed",
		generationFailureReason: failureReason,
		operatorNoteDeliveryStatus: "delivery_failed",
		operatorNoteDeliveryFailureReason: failureReason,
	});

	return null;
}

export async function markOperatorActionNoteDeliveryHandler(
	ctx: MutationCtx,
	args: {
		operatorActionId: SupportOperatorActionId;
		status: "delivered" | "delivery_failed";
		telegramMessageId: number | null;
		failureReason: string | null;
	},
) {
	await ctx.db.patch(args.operatorActionId, {
		operatorNoteDeliveryStatus: args.status,
		operatorNoteTelegramMessageId: args.telegramMessageId ?? undefined,
		operatorNoteDeliveryFailureReason: args.failureReason ?? undefined,
	});

	return null;
}

export async function getFailedVisitorMessageForRecoveryHandler(
	ctx: QueryCtx | MutationCtx,
	args: { messageId: SupportMessageId },
): Promise<FailedMessageForRecovery | null> {
	const message = await ctx.db.get(args.messageId);
	if (
		!message ||
		message.source !== "visitor" ||
		message.deliveryStatus !== "delivery_failed" ||
		!message.body ||
		message.bodyPurgedAt ||
		!isSupportDeliveryFailureRetryable(message.deliveryFailureClass) ||
		message.deliveryAttemptCount >= SUPPORT_VISITOR_DELIVERY_RETRY_LIMIT
	) {
		return null;
	}

	const thread = await ctx.db.get(message.threadId);
	if (!thread || thread.status !== "open" || thread.purgedAt) {
		return null;
	}

	return {
		messageId: message._id,
		threadId: thread._id,
		supportId: thread.supportId,
		messageText: message.body,
		attachment: getSupportMessageAttachmentForDelivery(message),
		deliveryAttemptCount: message.deliveryAttemptCount,
		entrySurface: thread.entrySurface,
		pagePath: thread.pagePath,
		telegramMessageThreadId: thread.telegramMessageThreadId ?? null,
		telegramHeaderMessageId: thread.telegramHeaderMessageId ?? null,
	};
}

export async function runSupportRetentionDatabaseMaintenanceHandler(
	ctx: MutationCtx,
	args: { now?: number },
): Promise<SupportRetentionMaintenanceResult> {
	const now = args.now ?? Date.now();
	const idleClosedThreadCount = await closeIdleAnonymousSupportThreads(
		ctx,
		now,
	);
	const purgeResult = await purgeExpiredSupportTranscripts(ctx, now);
	const deletedRateLimitBucketCount =
		await deleteExpiredSupportRateLimitBuckets(ctx, now);
	const pendingCleanups = await listRetryableTelegramTopicCleanups(ctx);

	return {
		...purgeResult,
		idleClosedThreadCount,
		deletedRateLimitBucketCount,
		telegramTopicCleanups: mergeSupportTelegramTopicCleanups(
			purgeResult.telegramTopicCleanups,
			pendingCleanups,
		),
	};
}

export async function markSupportThreadTelegramTopicCleanupHandler(
	ctx: MutationCtx,
	args: {
		threadId: SupportThreadId;
		status: "completed" | "failed";
		failureReason: string | null;
	},
) {
	const now = Date.now();
	await ctx.db.patch(args.threadId, {
		telegramTopicCleanupStatus: args.status,
		telegramTopicCleanupAttemptedAt: now,
		telegramTopicCleanupFailureReason:
			args.status === "failed"
				? trimProviderError(
						args.failureReason ?? "Telegram topic cleanup failed.",
					)
				: undefined,
		updatedAt: now,
	});

	return null;
}

export async function getSupportOperationsSnapshotHandler(
	ctx: QueryCtx,
	args: { now?: number },
): Promise<SupportOperationsSnapshot> {
	const now = args.now ?? Date.now();
	const failedMessages = await ctx.db
		.query("supportMessages")
		.withIndex("by_delivery_status_and_created_at", (query) =>
			query.eq("deliveryStatus", "delivery_failed"),
		)
		.order("desc")
		.take(SUPPORT_OPERATIONS_SNAPSHOT_LIMIT);
	const failedVisitorMessages: SupportOperationsSnapshot["failedVisitorMessages"] =
		[];
	for (const message of failedMessages) {
		if (message.source !== "visitor") {
			continue;
		}
		const thread = await ctx.db.get(message.threadId);
		if (!thread) {
			continue;
		}
		failedVisitorMessages.push({
			messageId: message._id,
			threadId: thread._id,
			supportId: thread.supportId,
			deliveryFailureClass: message.deliveryFailureClass ?? null,
			deliveryAttemptCount: message.deliveryAttemptCount,
			lastDeliveryAttemptAt: message.lastDeliveryAttemptAt ?? null,
			retryEligible: isFailedVisitorMessageRetryEligible(message, thread),
		});
	}

	const failedOperatorNotes = await ctx.db
		.query("supportOperatorActions")
		.withIndex("by_operator_note_delivery_status_and_created_at", (query) =>
			query.eq("operatorNoteDeliveryStatus", "delivery_failed"),
		)
		.order("desc")
		.take(SUPPORT_OPERATIONS_SNAPSHOT_LIMIT);
	const operatorNoteDeliveryFailures: SupportOperationsSnapshot["operatorNoteDeliveryFailures"] =
		[];
	for (const action of failedOperatorNotes) {
		const thread = await ctx.db.get(action.threadId);
		if (!thread) {
			continue;
		}
		operatorNoteDeliveryFailures.push({
			operatorActionId: action._id,
			threadId: thread._id,
			supportId: thread.supportId,
			actionType: action.actionType,
			failureReason: action.operatorNoteDeliveryFailureReason ?? null,
			createdAt: action.createdAt,
		});
	}

	const idleThreads = await ctx.db
		.query("supportThreads")
		.withIndex("by_status_and_idle_close_after", (query) =>
			query.eq("status", "open").lte("idleCloseAfter", now),
		)
		.take(SUPPORT_OPERATIONS_SNAPSHOT_LIMIT);
	const idleThreadsDueForClose: SupportOperationsSnapshot["idleThreadsDueForClose"] =
		[];
	for (const thread of idleThreads) {
		const visitor = await ctx.db.get(thread.visitorId);
		idleThreadsDueForClose.push({
			threadId: thread._id,
			supportId: thread.supportId,
			visitorKind: visitor?.visitorKind ?? "anonymous",
			idleCloseAfter: thread.idleCloseAfter,
		});
	}

	const purgeThreads = await ctx.db
		.query("supportThreads")
		.withIndex("by_status_and_purge_after", (query) =>
			query.eq("status", "closed").lte("purgeAfter", now),
		)
		.take(SUPPORT_OPERATIONS_SNAPSHOT_LIMIT);

	const cleanupFailures = await ctx.db
		.query("supportThreads")
		.withIndex("by_telegram_topic_cleanup_status_and_updated_at", (query) =>
			query.eq("telegramTopicCleanupStatus", "failed"),
		)
		.order("desc")
		.take(SUPPORT_OPERATIONS_SNAPSHOT_LIMIT);

	return {
		generatedAt: now,
		failedVisitorMessages,
		operatorNoteDeliveryFailures,
		idleThreadsDueForClose,
		transcriptsDueForPurge: purgeThreads.map((thread) => ({
			threadId: thread._id,
			supportId: thread.supportId,
			purgeAfter: thread.purgeAfter ?? now,
		})),
		telegramTopicCleanupFailures: cleanupFailures.map((thread) => ({
			threadId: thread._id,
			supportId: thread.supportId,
			failureReason: thread.telegramTopicCleanupFailureReason ?? null,
			lastAttemptedAt: thread.telegramTopicCleanupAttemptedAt ?? null,
		})),
	};
}

export async function deliverSupportVisitorMessage({
	threadId,
	supportId,
	messageText,
	attachment,
	entrySurface,
	pagePath,
	telegramMessageThreadId,
	telegramHeaderMessageId,
	markThreadTelegramTopic,
	markThreadTelegramHeader,
}: {
	threadId: SupportThreadId;
	supportId: string;
	messageText: string;
	attachment: SupportMessageAttachmentDelivery | null;
	entrySurface: string;
	pagePath: string;
	telegramMessageThreadId: number | null;
	telegramHeaderMessageId: number | null;
	markThreadTelegramTopic: (args: {
		threadId: SupportThreadId;
		telegramMessageThreadId: number;
	}) => Promise<unknown>;
	markThreadTelegramHeader: (args: {
		threadId: SupportThreadId;
		telegramHeaderMessageId: number;
	}) => Promise<unknown>;
}) {
	const entryLabel = formatSupportTelegramEntryLabel(entrySurface);
	const normalizedPagePath = normalizePagePath(pagePath);
	let messageThreadId = telegramMessageThreadId;
	if (!messageThreadId) {
		const topic = await createTelegramSupportTopic(
			`${supportId} ${entryLabel} ${new Date().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			})}`,
		);
		messageThreadId = topic.messageThreadId;
		await markThreadTelegramTopic({
			threadId,
			telegramMessageThreadId: messageThreadId,
		});
	}

	if (!telegramHeaderMessageId) {
		const header = await sendTelegramSupportMessage({
			messageThreadId,
			text: [
				`${supportId}`,
				"Status: Needs reply",
				`From: ${entryLabel}`,
				`Page: ${normalizedPagePath}`,
				"Visitor: anonymous or signed in on site",
				"Reply in this topic to message the visitor.",
			].join("\n"),
			replyMarkup: buildTelegramSupportActionKeyboard(supportId),
		});
		await markThreadTelegramHeader({
			threadId,
			telegramHeaderMessageId: header.messageId,
		});
	}

	if (!attachment) {
		return await sendTelegramSupportMessage({
			messageThreadId,
			text: messageText,
		});
	}

	await sendTelegramSupportMessage({
		messageThreadId,
		text: messageText,
	});

	return await sendTelegramSupportPhoto({
		messageThreadId,
		photoUrl: attachment.url,
		caption: formatSupportScreenshotCaption(attachment),
	});
}

export function createSupportDeliveryFailure(error: unknown) {
	const errorMessage =
		error instanceof Error ? error.message : "Unknown error.";

	return {
		errorMessage,
		deliveryFailureClass: classifySupportDeliveryError(error),
	};
}

export function formatSupportTelegramEntryLabel(entrySurface: string) {
	const normalizedEntrySurface = normalizeEntrySurface(entrySurface);
	if (normalizedEntrySurface === "homepage_support_widget") {
		return "homepage";
	}
	if (normalizedEntrySurface === "workspace_support_widget") {
		return "workspace";
	}

	return normalizedEntrySurface.replaceAll(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
}

async function closeIdleAnonymousSupportThreads(ctx: MutationCtx, now: number) {
	const threads = await ctx.db
		.query("supportThreads")
		.withIndex("by_status_and_idle_close_after", (query) =>
			query.eq("status", "open").lte("idleCloseAfter", now),
		)
		.take(SUPPORT_RETENTION_THREAD_BATCH_SIZE);
	let closedThreadCount = 0;

	for (const thread of threads) {
		const visitor = await ctx.db.get(thread.visitorId);
		if (visitor?.visitorKind === "signed_in") {
			await ctx.db.patch(thread._id, {
				idleCloseAfter: now + SUPPORT_IDLE_CLOSE_MS,
				updatedAt: now,
			});
			continue;
		}

		await ctx.db.patch(thread._id, {
			status: "closed",
			updatedAt: now,
			closedAt: now,
			retainUntil: now + SUPPORT_CLOSED_RETENTION_MS,
			purgeAfter: now + SUPPORT_CLOSED_RETENTION_MS,
		});
		closedThreadCount += 1;
	}

	return closedThreadCount;
}

async function purgeExpiredSupportTranscripts(
	ctx: MutationCtx,
	now: number,
): Promise<
	Omit<
		SupportRetentionMaintenanceResult,
		"idleClosedThreadCount" | "deletedRateLimitBucketCount"
	>
> {
	const threads = await ctx.db
		.query("supportThreads")
		.withIndex("by_status_and_purge_after", (query) =>
			query.eq("status", "closed").lte("purgeAfter", now),
		)
		.take(SUPPORT_RETENTION_THREAD_BATCH_SIZE);
	let purgedThreadCount = 0;
	let purgedMessageBodyCount = 0;
	let purgedGeneratedOutputCount = 0;
	const telegramTopicCleanups: SupportTelegramTopicCleanup[] = [];

	for (const thread of threads) {
		const messagePurge = await purgeSupportMessageBodies(ctx, thread._id, now);
		const outputPurge = await purgeSupportGeneratedOutputs(
			ctx,
			thread._id,
			now,
		);
		purgedMessageBodyCount += messagePurge.purgedCount;
		purgedGeneratedOutputCount += outputPurge.purgedCount;
		if (messagePurge.limitReached || outputPurge.limitReached) {
			continue;
		}

		const telegramTopicCleanupStatus = thread.telegramMessageThreadId
			? "pending"
			: "not_required";
		await ctx.db.patch(thread._id, {
			updatedAt: now,
			purgedAt: now,
			retainUntil: undefined,
			purgeAfter: undefined,
			telegramTopicCleanupStatus,
			telegramTopicCleanupAttemptedAt: undefined,
			telegramTopicCleanupFailureReason: undefined,
		});
		purgedThreadCount += 1;
		if (thread.telegramMessageThreadId) {
			telegramTopicCleanups.push({
				threadId: thread._id,
				supportId: thread.supportId,
				messageThreadId: thread.telegramMessageThreadId,
			});
		}
	}

	return {
		purgedThreadCount,
		purgedMessageBodyCount,
		purgedGeneratedOutputCount,
		telegramTopicCleanups,
	};
}

async function purgeSupportMessageBodies(
	ctx: MutationCtx,
	threadId: SupportThreadId,
	now: number,
) {
	let purgedCount = 0;
	let writeCount = 0;
	let limitReached = false;
	const messages = ctx.db
		.query("supportMessages")
		.withIndex("by_thread_id_and_created_at", (query) =>
			query.eq("threadId", threadId),
		)
		.order("asc");

	for await (const message of messages) {
		const shouldPurgeBody = Boolean(message.body);
		const shouldPurgeAttachment = Boolean(
			message.attachmentStorageId && !message.attachmentPurgedAt,
		);
		if (!shouldPurgeBody && !shouldPurgeAttachment) {
			continue;
		}

		if (message.attachmentStorageId && !message.attachmentPurgedAt) {
			await ctx.storage.delete(message.attachmentStorageId);
		}

		await ctx.db.patch(message._id, {
			body: shouldPurgeBody ? undefined : message.body,
			bodyPurgedAt: shouldPurgeBody ? now : message.bodyPurgedAt,
			attachmentStorageId: shouldPurgeAttachment
				? undefined
				: message.attachmentStorageId,
			attachmentFileName: shouldPurgeAttachment
				? undefined
				: message.attachmentFileName,
			attachmentContentType: shouldPurgeAttachment
				? undefined
				: message.attachmentContentType,
			attachmentSize: shouldPurgeAttachment
				? undefined
				: message.attachmentSize,
			attachmentKind: shouldPurgeAttachment
				? undefined
				: message.attachmentKind,
			attachmentPurgedAt: shouldPurgeAttachment
				? now
				: message.attachmentPurgedAt,
		});
		if (shouldPurgeBody) {
			purgedCount += 1;
		}
		writeCount += 1;
		if (writeCount >= SUPPORT_TRANSCRIPT_PURGE_WRITE_LIMIT) {
			limitReached = true;
			break;
		}
	}

	return { purgedCount, limitReached };
}

async function purgeSupportGeneratedOutputs(
	ctx: MutationCtx,
	threadId: SupportThreadId,
	now: number,
) {
	let purgedCount = 0;
	let limitReached = false;
	const actions = ctx.db
		.query("supportOperatorActions")
		.withIndex("by_thread_id_and_created_at", (query) =>
			query.eq("threadId", threadId),
		)
		.order("asc");

	for await (const action of actions) {
		if (!action.generatedOutput) {
			continue;
		}
		await ctx.db.patch(action._id, {
			generatedOutput: undefined,
			generatedOutputPurgedAt: now,
		});
		purgedCount += 1;
		if (purgedCount >= SUPPORT_TRANSCRIPT_PURGE_WRITE_LIMIT) {
			limitReached = true;
			break;
		}
	}

	return { purgedCount, limitReached };
}

async function deleteExpiredSupportRateLimitBuckets(
	ctx: MutationCtx,
	now: number,
) {
	const buckets = await ctx.db
		.query("supportRateLimitBuckets")
		.withIndex("by_updated_at", (query) =>
			query.lte("updatedAt", now - SUPPORT_RATE_BUCKET_RETENTION_MS),
		)
		.take(SUPPORT_TRANSCRIPT_PURGE_WRITE_LIMIT);

	for (const bucket of buckets) {
		await ctx.db.delete(bucket._id);
	}

	return buckets.length;
}

async function listRetryableTelegramTopicCleanups(ctx: MutationCtx) {
	const [pendingCleanups, failedCleanups] = await Promise.all([
		listTelegramTopicCleanupsByStatus(ctx, "pending"),
		listTelegramTopicCleanupsByStatus(ctx, "failed"),
	]);

	return mergeSupportTelegramTopicCleanups(pendingCleanups, failedCleanups);
}

async function listTelegramTopicCleanupsByStatus(
	ctx: MutationCtx,
	status: "pending" | "failed",
) {
	const threads = await ctx.db
		.query("supportThreads")
		.withIndex("by_telegram_topic_cleanup_status_and_updated_at", (query) =>
			query.eq("telegramTopicCleanupStatus", status),
		)
		.take(SUPPORT_RETENTION_THREAD_BATCH_SIZE);

	return threads.flatMap((thread): SupportTelegramTopicCleanup[] =>
		thread.telegramMessageThreadId
			? [
					{
						threadId: thread._id,
						supportId: thread.supportId,
						messageThreadId: thread.telegramMessageThreadId,
					},
				]
			: [],
	);
}

function mergeSupportTelegramTopicCleanups(
	...cleanupGroups: SupportTelegramTopicCleanup[][]
) {
	const cleanupsByThreadId = new Map<string, SupportTelegramTopicCleanup>();
	for (const cleanupGroup of cleanupGroups) {
		for (const cleanup of cleanupGroup) {
			cleanupsByThreadId.set(cleanup.threadId, cleanup);
		}
	}

	return [...cleanupsByThreadId.values()];
}

function isFailedVisitorMessageRetryEligible(
	message: Doc<"supportMessages">,
	thread: Doc<"supportThreads">,
) {
	return (
		message.source === "visitor" &&
		message.deliveryStatus === "delivery_failed" &&
		Boolean(message.body) &&
		!message.bodyPurgedAt &&
		!thread.purgedAt &&
		thread.status === "open" &&
		isSupportDeliveryFailureRetryable(message.deliveryFailureClass) &&
		message.deliveryAttemptCount < SUPPORT_VISITOR_DELIVERY_RETRY_LIMIT
	);
}

function isSupportDeliveryFailureRetryable(
	deliveryFailureClass: SupportDeliveryFailureClass | undefined,
) {
	return Boolean(
		deliveryFailureClass && deliveryFailureClass !== "content_rejected",
	);
}

function isSupportChatDisabled() {
	const rawValue = readOptionalConvexEnv("SUPPORT_CHAT_DISABLED");
	return rawValue === "1" || rawValue?.toLowerCase() === "true";
}

function createEmptyThreadState(): SupportThreadState {
	return {
		status: "empty",
		supportId: null,
		messages: [],
		fallbackHref: SUPPORT_FALLBACK_HREF,
		error: null,
	};
}

function createDisabledThreadState(): SupportThreadState {
	return {
		status: "disabled",
		supportId: null,
		messages: [],
		fallbackHref: SUPPORT_FALLBACK_HREF,
		error: "Ship by Sunday support is using Telegram directly right now.",
	};
}

async function buildSupportThreadState(
	ctx: QueryCtx | MutationCtx,
	thread: Doc<"supportThreads">,
): Promise<SupportThreadState> {
	const messages = await ctx.db
		.query("supportMessages")
		.withIndex("by_thread_id_and_created_at", (query) =>
			query.eq("threadId", thread._id),
		)
		.order("desc")
		.take(50);
	const chronologicalMessages = [...messages].reverse();
	const messagesWithAttachments = await Promise.all(
		chronologicalMessages.map(async (message) => ({
			message,
			attachment: await buildPublicSupportMessageAttachment(ctx, message),
		})),
	);

	return {
		status: thread.status,
		supportId: thread.supportId,
		fallbackHref: SUPPORT_FALLBACK_HREF,
		error: null,
		messages: messagesWithAttachments.map(({ message, attachment }) => ({
			id: message._id,
			source: message.source,
			body: message.body ?? null,
			attachment,
			createdAt: message.createdAt,
			deliveryStatus: message.deliveryStatus,
			deliveryFailureClass: message.deliveryFailureClass ?? null,
		})),
	};
}

async function buildPublicSupportMessageAttachment(
	ctx: QueryCtx | MutationCtx,
	message: Doc<"supportMessages">,
): Promise<SupportThreadState["messages"][number]["attachment"]> {
	if (
		message.attachmentKind !== "screenshot" ||
		!message.attachmentStorageId ||
		message.attachmentPurgedAt
	) {
		return null;
	}

	const url = await ctx.storage.getUrl(message.attachmentStorageId);
	return {
		kind: "screenshot",
		fileName: message.attachmentFileName ?? "screenshot.png",
		contentType: message.attachmentContentType ?? "image/png",
		size: message.attachmentSize ?? 0,
		url,
	};
}

function getSupportMessageAttachmentForDelivery(
	message: Doc<"supportMessages">,
): SupportMessageAttachment | null {
	if (
		message.attachmentKind !== "screenshot" ||
		!message.attachmentStorageId ||
		!message.attachmentFileName ||
		!message.attachmentContentType ||
		!message.attachmentSize ||
		message.attachmentPurgedAt ||
		!isSupportScreenshotContentType(message.attachmentContentType)
	) {
		return null;
	}

	return {
		kind: "screenshot",
		storageId: message.attachmentStorageId,
		fileName: message.attachmentFileName,
		contentType: message.attachmentContentType,
		size: message.attachmentSize,
	};
}

function formatSupportScreenshotCaption(
	attachment: SupportMessageAttachmentDelivery,
) {
	return `Screenshot: ${attachment.fileName} (${formatSupportAttachmentSize(attachment.size)})`;
}

async function findSupportVisitorBySessionTokenHash(
	ctx: QueryCtx | MutationCtx,
	sessionTokenHash: string,
) {
	return await ctx.db
		.query("supportVisitors")
		.withIndex("by_session_token_hash", (query) =>
			query.eq("sessionTokenHash", sessionTokenHash),
		)
		.unique();
}

async function findCurrentSupportThreadByVisitorId(
	ctx: QueryCtx | MutationCtx,
	visitorId: GenericId<"supportVisitors">,
) {
	const openThread = await findOpenSupportThreadByVisitorId(ctx, visitorId);
	if (openThread) {
		return openThread;
	}

	return await findLatestUnpurgedClosedSupportThreadByVisitorId(ctx, visitorId);
}

async function findOpenSupportThreadByVisitorId(
	ctx: QueryCtx | MutationCtx,
	visitorId: GenericId<"supportVisitors">,
) {
	return await ctx.db
		.query("supportThreads")
		.withIndex("by_visitor_id_and_status", (query) =>
			query.eq("visitorId", visitorId).eq("status", "open"),
		)
		.unique();
}

async function findLatestUnpurgedClosedSupportThreadByVisitorId(
	ctx: QueryCtx | MutationCtx,
	visitorId: GenericId<"supportVisitors">,
) {
	const now = Date.now();
	const closedThreads = await ctx.db
		.query("supportThreads")
		.withIndex("by_visitor_id_and_status", (query) =>
			query.eq("visitorId", visitorId).eq("status", "closed"),
		)
		.order("desc")
		.take(10);

	return (
		closedThreads.find(
			(thread) =>
				!thread.purgedAt && (!thread.purgeAfter || thread.purgeAfter > now),
		) ?? null
	);
}

async function getOrCreateSupportVisitor(
	ctx: MutationCtx,
	args: {
		sessionTokenHash: string;
		clerkUserId: string | null;
		pagePath: string;
		now: number;
	},
) {
	const existing = await findSupportVisitorBySessionTokenHash(
		ctx,
		args.sessionTokenHash,
	);
	if (existing) {
		await ctx.db.patch(existing._id, {
			clerkUserId: args.clerkUserId ?? existing.clerkUserId,
			visitorKind: args.clerkUserId ? "signed_in" : existing.visitorKind,
			lastSeenAt: args.now,
			lastPagePath: args.pagePath,
		});
		return {
			...existing,
			clerkUserId: args.clerkUserId ?? existing.clerkUserId,
			visitorKind: args.clerkUserId ? "signed_in" : existing.visitorKind,
			lastSeenAt: args.now,
			lastPagePath: args.pagePath,
		};
	}

	const visitorId = await ctx.db.insert("supportVisitors", {
		sessionTokenHash: args.sessionTokenHash,
		status: "active",
		visitorKind: args.clerkUserId ? "signed_in" : "anonymous",
		clerkUserId: args.clerkUserId ?? undefined,
		firstSeenAt: args.now,
		lastSeenAt: args.now,
		lastPagePath: args.pagePath,
	});
	const visitor = await ctx.db.get(visitorId);
	if (!visitor) {
		throw new Error("Unable to create support visitor.");
	}

	return visitor;
}

async function getOrCreateSupportThreadForVisitorMessage(
	ctx: MutationCtx,
	args: {
		visitorId: GenericId<"supportVisitors">;
		entrySurface: string;
		pagePath: string;
		now: number;
	},
) {
	const existing = await findCurrentSupportThreadByVisitorId(
		ctx,
		args.visitorId,
	);
	if (existing) {
		return { thread: existing, isNewThread: false };
	}

	const threadId = await ctx.db.insert("supportThreads", {
		visitorId: args.visitorId,
		supportId: createSupportId(args.now),
		status: "open",
		entrySurface: args.entrySurface,
		pagePath: args.pagePath,
		createdAt: args.now,
		updatedAt: args.now,
		lastMessageAt: args.now,
		lastVisitorMessageAt: undefined,
		leadStatus: "standard",
		pendingVisitorMessageCount: 0,
		telegramChatId: undefined,
		telegramMessageThreadId: undefined,
		telegramHeaderMessageId: undefined,
		closedAt: undefined,
		idleCloseAfter: args.now + SUPPORT_IDLE_CLOSE_MS,
		retainUntil: undefined,
		purgeAfter: undefined,
	});
	const thread = await ctx.db.get(threadId);
	if (!thread) {
		throw new Error("Unable to create support thread.");
	}

	return { thread, isNewThread: true };
}

async function insertFirstMessageAcknowledgements(
	ctx: MutationCtx,
	args: {
		threadId: SupportThreadId;
		visitorId: GenericId<"supportVisitors">;
		now: number;
	},
) {
	let lastMessageAt = args.now;
	for (const [
		index,
		body,
	] of SUPPORT_FIRST_MESSAGE_ACKNOWLEDGEMENTS.entries()) {
		const createdAt = args.now + index + 1;
		await ctx.db.insert("supportMessages", {
			threadId: args.threadId,
			visitorId: args.visitorId,
			source: "system",
			body,
			createdAt,
			deliveryStatus: "not_required",
			deliveryAttemptCount: 0,
			lastDeliveryAttemptAt: undefined,
			lastDeliveryError: undefined,
			deliveryFailureClass: undefined,
			telegramMessageId: undefined,
			telegramUpdateId: undefined,
			telegramOperatorUserId: undefined,
			bodyPurgedAt: undefined,
		});
		lastMessageAt = createdAt;
	}

	return lastMessageAt;
}

function assertThreadCanAcceptVisitorMessage(
	thread: Doc<"supportThreads">,
	now: number,
) {
	if (thread.status !== "open") {
		throw new Error("Support thread is closed.");
	}
	if (
		thread.lastVisitorMessageAt &&
		now - thread.lastVisitorMessageAt < SUPPORT_SEND_COOLDOWN_MS
	) {
		throw new Error("Please wait a moment before sending another message.");
	}
	if (
		thread.pendingVisitorMessageCount >= SUPPORT_PENDING_VISITOR_MESSAGE_LIMIT
	) {
		throw new Error(
			"Parker has your messages. Wait for a reply before sending more.",
		);
	}
}

async function assertGlobalHourlyLimit(ctx: MutationCtx, now: number) {
	const bucketKey = `global:${Math.floor(now / (60 * 60 * 1_000))}`;
	const existing = await ctx.db
		.query("supportRateLimitBuckets")
		.withIndex("by_bucket_key", (query) => query.eq("bucketKey", bucketKey))
		.unique();
	if (existing && existing.messageCount >= SUPPORT_GLOBAL_HOURLY_LIMIT) {
		throw new Error("Support is busy. Use Telegram directly for now.");
	}
	if (existing) {
		await ctx.db.patch(existing._id, {
			messageCount: existing.messageCount + 1,
			updatedAt: now,
		});
		return;
	}

	await ctx.db.insert("supportRateLimitBuckets", {
		bucketKey,
		windowStartedAt: Math.floor(now / (60 * 60 * 1_000)) * 60 * 60 * 1_000,
		messageCount: 1,
		updatedAt: now,
	});
}

async function requireSupportThread(
	ctx: MutationCtx,
	threadId: SupportThreadId,
) {
	const thread = await ctx.db.get(threadId);
	if (!thread) {
		throw new Error("Support thread not found.");
	}

	return thread;
}

async function findSupportThreadByTelegramTopic(
	ctx: MutationCtx,
	args: {
		chatId: string;
		messageThreadId: number;
	},
) {
	return await ctx.db
		.query("supportThreads")
		.withIndex("by_telegram_chat_id_and_message_thread_id", (query) =>
			query
				.eq("telegramChatId", args.chatId)
				.eq("telegramMessageThreadId", args.messageThreadId),
		)
		.unique();
}

async function listRecentThreadMessages(
	ctx: QueryCtx | MutationCtx,
	threadId: SupportThreadId,
) {
	const messages = await ctx.db
		.query("supportMessages")
		.withIndex("by_thread_id_and_created_at", (query) =>
			query.eq("threadId", threadId),
		)
		.order("desc")
		.take(20);

	return [...messages].reverse();
}

function findLatestVisitorMessageId(
	messages: readonly Doc<"supportMessages">[],
) {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index];
		if (message?.source === "visitor") {
			return message._id;
		}
	}

	return null;
}

async function insertIgnoredOperatorAction(
	ctx: MutationCtx,
	args: {
		threadId: SupportThreadId;
		actionType: SupportOperatorActionType;
		operatorTelegramUserId: number;
		telegramCallbackQueryId: string;
		telegramUpdateId: number;
		sourceMessageId?: SupportMessageId | null;
		failureReason: string;
	},
) {
	await ctx.db.insert("supportOperatorActions", {
		threadId: args.threadId,
		actionType: args.actionType,
		status: "ignored",
		operatorTelegramUserId: args.operatorTelegramUserId,
		telegramCallbackQueryId: args.telegramCallbackQueryId,
		telegramUpdateId: args.telegramUpdateId,
		sourceMessageId: args.sourceMessageId ?? undefined,
		customerVisibleMessageId: undefined,
		generatedOutput: undefined,
		generatedOutputSource: undefined,
		generatedOutputModel: undefined,
		generatedOutputPurgedAt: undefined,
		generationFailureReason: undefined,
		aiDraftGenerationStatus: "not_required",
		operatorNoteDeliveryStatus: "not_required",
		operatorNoteTelegramMessageId: undefined,
		operatorNoteDeliveryFailureReason: undefined,
		failureReason: args.failureReason,
		createdAt: Date.now(),
		completedAt: undefined,
	});
}

function createIgnoredOperatorActionResult(
	reason: string,
	callbackAnswerText: string,
): ApplySupportOperatorActionResult {
	return {
		ok: true,
		ignored: true,
		reason,
		callbackAnswerText,
		operatorNoteText: null,
		operatorActionId: null,
		aiDraftSchedulingStatus: "not_required",
		aiDraftSchedulingFailureReason: null,
	};
}

function createIgnoredDraftDecisionResult(
	reason: string,
	callbackAnswerText: string,
): ApplySupportDraftDecisionResult {
	return {
		ok: true,
		ignored: true,
		reason,
		callbackAnswerText,
	};
}

function normalizeEntrySurface(value: string) {
	const normalized = value.trim();
	return normalized || "homepage";
}

function normalizePagePath(value: string) {
	const normalized = value.trim();
	if (!normalized.startsWith("/")) {
		return "/";
	}

	return normalized.slice(0, 256);
}

function createSupportId(now: number) {
	const date = new Date(now);
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	const suffix = Math.floor(1000 + Math.random() * 9000);
	return `SBS-${month}${day}-${suffix}`;
}

function trimProviderError(message: string) {
	return message.slice(0, 500);
}
