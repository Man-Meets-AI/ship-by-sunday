import { v } from "convex/values";

export const supportVisitorStatusValues = ["active", "blocked"] as const;
export const supportThreadStatusValues = ["open", "closed"] as const;
export const supportThreadLeadStatusValues = ["standard", "hot"] as const;
export const supportVisitorKindValues = ["anonymous", "signed_in"] as const;
export const supportMessageSourceValues = [
	"visitor",
	"operator",
	"system",
] as const;
export const supportAttachmentKindValues = ["screenshot"] as const;
export const supportDeliveryStatusValues = [
	"not_required",
	"sending",
	"delivered_to_parker",
	"delivery_failed",
] as const;
export const supportDeliveryFailureClassValues = [
	"missing_provider_config",
	"authorization_failed",
	"topic_permission_failed",
	"rate_limited",
	"content_rejected",
	"network_error",
	"provider_error",
	"unknown",
] as const;
export const supportOperatorActionStatusValues = [
	"completed",
	"ignored",
	"failed",
] as const;
export const supportAiDraftGenerationStatusValues = [
	"not_required",
	"scheduled",
	"completed",
	"failed",
] as const;
export const supportGeneratedOutputSourceValues = [
	"deterministic",
	"openai_responses",
] as const;
export const supportOperatorNoteDeliveryStatusValues = [
	"not_required",
	"pending",
	"delivered",
	"delivery_failed",
] as const;
export const supportDraftDecisionStatusValues = ["sent", "discarded"] as const;
export const supportTelegramTopicCleanupStatusValues = [
	"not_required",
	"pending",
	"completed",
	"failed",
] as const;
export const supportConversationCapabilityStatusValues = [
	"active",
	"revoked",
] as const;

export const supportVisitorStatusValidator = v.union(
	v.literal("active"),
	v.literal("blocked"),
);
export const supportThreadStatusValidator = v.union(
	v.literal("open"),
	v.literal("closed"),
);
export const supportThreadLeadStatusValidator = v.union(
	v.literal("standard"),
	v.literal("hot"),
);
export const supportVisitorKindValidator = v.union(
	v.literal("anonymous"),
	v.literal("signed_in"),
);
export const supportMessageSourceValidator = v.union(
	v.literal("visitor"),
	v.literal("operator"),
	v.literal("system"),
);
export const supportAttachmentKindValidator = v.union(v.literal("screenshot"));
export const supportDeliveryStatusValidator = v.union(
	v.literal("not_required"),
	v.literal("sending"),
	v.literal("delivered_to_parker"),
	v.literal("delivery_failed"),
);
export const supportDeliveryFailureClassValidator = v.union(
	v.literal("missing_provider_config"),
	v.literal("authorization_failed"),
	v.literal("topic_permission_failed"),
	v.literal("rate_limited"),
	v.literal("content_rejected"),
	v.literal("network_error"),
	v.literal("provider_error"),
	v.literal("unknown"),
);
export const supportOperatorActionTypeValidator = v.union(
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
);
export const supportAiDraftActionTypeValidator = v.union(
	v.literal("draft_reply"),
	v.literal("summarize_lead"),
	v.literal("generate_codex_prompt"),
	v.literal("create_linear_draft"),
);
export const supportOperatorActionStatusValidator = v.union(
	v.literal("completed"),
	v.literal("ignored"),
	v.literal("failed"),
);
export const supportAiDraftGenerationStatusValidator = v.union(
	v.literal("not_required"),
	v.literal("scheduled"),
	v.literal("completed"),
	v.literal("failed"),
);
export const supportGeneratedOutputSourceValidator = v.union(
	v.literal("deterministic"),
	v.literal("openai_responses"),
);
export const supportOperatorNoteDeliveryStatusValidator = v.union(
	v.literal("not_required"),
	v.literal("pending"),
	v.literal("delivered"),
	v.literal("delivery_failed"),
);
export const supportDraftDecisionStatusValidator = v.union(
	v.literal("sent"),
	v.literal("discarded"),
);
export const supportTelegramTopicCleanupStatusValidator = v.union(
	v.literal("not_required"),
	v.literal("pending"),
	v.literal("completed"),
	v.literal("failed"),
);
export const supportConversationCapabilityStatusValidator = v.union(
	v.literal("active"),
	v.literal("revoked"),
);

export const supportPublicMessageValidator = v.object({
	id: v.string(),
	source: supportMessageSourceValidator,
	body: v.union(v.string(), v.null()),
	attachment: v.union(
		v.object({
			kind: supportAttachmentKindValidator,
			fileName: v.string(),
			contentType: v.string(),
			size: v.number(),
			url: v.union(v.string(), v.null()),
		}),
		v.null(),
	),
	createdAt: v.number(),
	deliveryStatus: supportDeliveryStatusValidator,
	deliveryFailureClass: v.union(supportDeliveryFailureClassValidator, v.null()),
});

export const supportThreadStateValidator = v.object({
	status: v.union(
		v.literal("empty"),
		v.literal("open"),
		v.literal("closed"),
		v.literal("disabled"),
	),
	supportId: v.union(v.string(), v.null()),
	messages: v.array(supportPublicMessageValidator),
	fallbackHref: v.string(),
	error: v.union(v.string(), v.null()),
});

export const telegramSupportWebhookResultValidator = v.object({
	ok: v.boolean(),
	ignored: v.boolean(),
	reason: v.union(v.string(), v.null()),
});

export const supportOperatorActionResultValidator = v.object({
	ok: v.boolean(),
	ignored: v.boolean(),
	reason: v.union(v.string(), v.null()),
	callbackAnswerText: v.union(v.string(), v.null()),
	operatorNoteText: v.union(v.string(), v.null()),
	operatorActionId: v.union(v.id("supportOperatorActions"), v.null()),
	aiDraftSchedulingStatus: v.union(
		v.literal("not_required"),
		v.literal("scheduled"),
		v.literal("scheduling_failed"),
	),
	aiDraftSchedulingFailureReason: v.union(v.string(), v.null()),
});

export const supportDraftDecisionResultValidator = v.object({
	ok: v.boolean(),
	ignored: v.boolean(),
	reason: v.union(v.string(), v.null()),
	callbackAnswerText: v.string(),
});

export const supportOperationsSnapshotValidator = v.object({
	generatedAt: v.number(),
	failedVisitorMessages: v.array(
		v.object({
			messageId: v.id("supportMessages"),
			threadId: v.id("supportThreads"),
			supportId: v.string(),
			deliveryFailureClass: v.union(
				supportDeliveryFailureClassValidator,
				v.null(),
			),
			deliveryAttemptCount: v.number(),
			lastDeliveryAttemptAt: v.union(v.number(), v.null()),
			retryEligible: v.boolean(),
		}),
	),
	operatorNoteDeliveryFailures: v.array(
		v.object({
			operatorActionId: v.id("supportOperatorActions"),
			threadId: v.id("supportThreads"),
			supportId: v.string(),
			actionType: supportOperatorActionTypeValidator,
			failureReason: v.union(v.string(), v.null()),
			createdAt: v.number(),
		}),
	),
	idleThreadsDueForClose: v.array(
		v.object({
			threadId: v.id("supportThreads"),
			supportId: v.string(),
			visitorKind: supportVisitorKindValidator,
			idleCloseAfter: v.number(),
		}),
	),
	transcriptsDueForPurge: v.array(
		v.object({
			threadId: v.id("supportThreads"),
			supportId: v.string(),
			purgeAfter: v.number(),
		}),
	),
	telegramTopicCleanupFailures: v.array(
		v.object({
			threadId: v.id("supportThreads"),
			supportId: v.string(),
			failureReason: v.union(v.string(), v.null()),
			lastAttemptedAt: v.union(v.number(), v.null()),
		}),
	),
});
