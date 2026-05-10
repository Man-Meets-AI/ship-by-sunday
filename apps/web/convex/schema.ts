import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { fieldValuesValidator } from "./course/validators";
import { codexRateLimitSnapshotsByIdValidator } from "./codexValidators";
import {
	incidentDeliveryStatusValidator,
	incidentEnvironmentValidator,
	incidentSeverityValidator,
	incidentSourceValidator,
	incidentStatusValidator,
	incidentSurfaceValidator,
	observabilityAlertStatusValidator,
	observabilitySeverityValidator,
	observabilitySourceValidator,
} from "./observability/validators";
import {
	supportAiDraftGenerationStatusValidator,
	supportAttachmentKindValidator,
	supportDeliveryFailureClassValidator,
	supportDeliveryStatusValidator,
	supportGeneratedOutputSourceValidator,
	supportDraftDecisionStatusValidator,
	supportMessageSourceValidator,
	supportOperatorNoteDeliveryStatusValidator,
	supportOperatorActionStatusValidator,
	supportTelegramTopicCleanupStatusValidator,
	supportOperatorActionTypeValidator,
	supportThreadLeadStatusValidator,
	supportThreadStatusValidator,
	supportVisitorKindValidator,
	supportVisitorStatusValidator,
} from "./support/validators";
import {
	codebaseFindingFields,
	doctorPassRunFields,
	managedGithubAuditEventFields,
	managedGithubExecutionConsentFields,
	workflowRunFields,
	workspaceProjectFields,
	workspaceRepositoryBindingFields,
	workspaceRunnerBindingFields,
	workspaceRunnerEventFields,
} from "./workspace/validators";
import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
} from "./checkoutIntentValidators";
import {
	impersonationAuditEventTypeValidator,
	impersonationAuditResultValidator,
	impersonationBlockReasonValidator,
	impersonationFailureReasonValidator,
	impersonationSessionInvalidationReasonValidator,
	impersonationSessionStatusValidator,
	impersonationSetupIntegrityIssueValidator,
} from "./impersonation/validators";

const projectDefinitionFactValueValidator = v.union(
	v.string(),
	v.number(),
	v.array(v.string()),
);

export default defineSchema({
	productAccessGrants: defineTable({
		clerkUserId: v.string(),
		status: v.union(
			v.literal("granted"),
			v.literal("pending"),
			v.literal("revoked"),
			v.literal("refunded"),
		),
		source: v.union(
			v.literal("manual"),
			v.literal("stripe_checkout"),
			v.literal("stripe_webhook"),
		),
		stripeCustomerId: v.optional(v.string()),
		stripeCheckoutSessionId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
		checkoutCtaId: v.optional(checkoutCtaIdValidator),
		fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
		grantedAt: v.number(),
		updatedAt: v.number(),
		revokedAt: v.optional(v.number()),
	})
		.index("by_clerk_user_id", ["clerkUserId"])
		.index("by_stripe_customer_id", ["stripeCustomerId"])
		.index("by_stripe_checkout_session_id", ["stripeCheckoutSessionId"]),
	pendingCheckoutClaims: defineTable({
		stripeCheckoutSessionId: v.string(),
		checkoutEmail: v.string(),
		checkoutEmailNormalized: v.string(),
		courseSlug: v.string(),
		paymentStatus: v.union(v.literal("paid"), v.literal("no_payment_required")),
		stripeCustomerId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
		checkoutCtaId: v.optional(checkoutCtaIdValidator),
		fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
		stripeEventId: v.string(),
		stripeEventType: v.string(),
		status: v.union(v.literal("pending"), v.literal("claimed")),
		claimedByClerkUserId: v.optional(v.string()),
		claimedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_stripe_checkout_session_id", ["stripeCheckoutSessionId"])
		.index("by_checkout_email_normalized", ["checkoutEmailNormalized"])
		.index("by_checkout_email_normalized_and_status_and_updated_at", [
			"checkoutEmailNormalized",
			"status",
			"updatedAt",
		]),
	// Deprecated: retained temporarily for historical private starter repository
	// invite records. No live app or operator path writes this table.
	starterRepoAccess: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		githubUsername: v.string(),
		githubUsernameLower: v.string(),
		status: v.union(
			v.literal("requested"),
			v.literal("invited"),
			v.literal("accepted"),
			v.literal("failed"),
		),
		requestedAt: v.number(),
		updatedAt: v.number(),
		invitedAt: v.optional(v.number()),
		acceptedAt: v.optional(v.number()),
		invitationId: v.optional(v.string()),
		lastError: v.optional(v.string()),
	})
		.index("by_clerk_user_id_and_course_slug", ["clerkUserId", "courseSlug"])
		.index("by_status", ["status"])
		.index("by_github_username_lower", ["githubUsernameLower"]),
	projectDefinitions: defineTable({
		clerkUserId: v.string(),
		productKey: v.string(),
		schemaVersion: v.number(),
		facts: v.record(v.string(), projectDefinitionFactValueValidator),
		placeholdersInUse: v.array(
			v.union(
				v.literal("domain"),
				v.literal("contact_email"),
				v.literal("support_email"),
			),
		),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_clerk_user_id_and_product_key", ["clerkUserId", "productKey"]),
	codebaseWorkflowStates: defineTable({
		clerkUserId: v.string(),
		productKey: v.string(),
		executeShipUnlockedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_clerk_user_id_and_product_key", ["clerkUserId", "productKey"]),
	workspaceProjects: defineTable(workspaceProjectFields)
		.index("by_clerk_user_id_and_status_and_updated_at", [
			"clerkUserId",
			"status",
			"updatedAt",
		])
		.index("by_clerk_user_id_and_updated_at", ["clerkUserId", "updatedAt"]),
	workspaceRunnerBindings: defineTable(workspaceRunnerBindingFields)
		.index("by_project_id_and_status_and_updated_at", [
			"projectId",
			"status",
			"updatedAt",
		])
		.index("by_project_id_and_updated_at", ["projectId", "updatedAt"])
		.index("by_pairing_token", ["pairingToken"])
		.index("by_runner_credential_hash", ["runnerCredentialHash"]),
	workspaceRepositoryBindings: defineTable(workspaceRepositoryBindingFields)
		.index("by_project_id_and_status_and_updated_at", [
			"projectId",
			"status",
			"updatedAt",
		])
		.index("by_runner_id_and_status_and_updated_at", [
			"runnerId",
			"status",
			"updatedAt",
		]),
	doctorPassRuns: defineTable(doctorPassRunFields)
		.index("by_project_id_and_status_and_started_at", [
			"projectId",
			"status",
			"startedAt",
		])
		.index("by_project_id_and_started_at", ["projectId", "startedAt"])
		.index("by_runner_id_and_started_at", ["runnerId", "startedAt"])
		.index("by_runner_id_and_local_run_id", ["runnerId", "localRunId"]),
	codebaseFindings: defineTable(codebaseFindingFields)
		.index("by_project_id_and_status_and_rank", ["projectId", "status", "rank"])
		.index("by_project_id_and_rank", ["projectId", "rank"])
		.index("by_project_id_and_finding_id", ["projectId", "findingId"])
		.index("by_doctor_pass_run_id_and_rank", ["doctorPassRunId", "rank"]),
	workflowRuns: defineTable(workflowRunFields)
		.index("by_project_id_and_status_and_created_at", [
			"projectId",
			"status",
			"createdAt",
		])
		.index("by_project_id_and_created_at", ["projectId", "createdAt"])
		.index("by_project_finding_workflow_status_created_at", [
			"projectId",
			"findingDocumentId",
			"workflowId",
			"status",
			"createdAt",
		])
		.index("by_runner_id_and_status_and_created_at", [
			"runnerId",
			"status",
			"createdAt",
		])
		.index("by_runner_id_and_created_at", ["runnerId", "createdAt"]),
	workspaceRunnerEvents: defineTable(workspaceRunnerEventFields)
		.index("by_event_id", ["eventId"])
		.index("by_project_id_and_created_at", ["projectId", "createdAt"])
		.index("by_project_id_and_event_type_and_created_at", [
			"projectId",
			"eventType",
			"createdAt",
		])
		.index("by_runner_id_and_created_at", ["runnerId", "createdAt"])
		.index("by_doctor_pass_run_id_and_created_at", [
			"doctorPassRunId",
			"createdAt",
		])
		.index("by_workflow_run_id_and_created_at", ["workflowRunId", "createdAt"]),
	managedGithubExecutionConsents: defineTable(
		managedGithubExecutionConsentFields,
	)
		.index("by_project_id_and_status_and_updated_at", [
			"projectId",
			"status",
			"updatedAt",
		])
		.index("by_project_id_and_updated_at", ["projectId", "updatedAt"])
		.index("by_repository_binding_id_and_updated_at", [
			"repositoryBindingId",
			"updatedAt",
		]),
	managedGithubAuditEvents: defineTable(managedGithubAuditEventFields)
		.index("by_project_id_and_created_at", ["projectId", "createdAt"])
		.index("by_consent_id_and_created_at", ["consentId", "createdAt"]),
	impersonationSessions: defineTable({
		actorClerkUserId: v.string(),
		actorEmail: v.string(),
		subjectClerkUserId: v.string(),
		subjectEmail: v.optional(v.string()),
		reason: v.string(),
		status: impersonationSessionStatusValidator,
		setupIntegrityIssues: v.array(impersonationSetupIntegrityIssueValidator),
		startedAt: v.number(),
		updatedAt: v.number(),
		expiresAt: v.number(),
		stoppedAt: v.optional(v.number()),
		failedAt: v.optional(v.number()),
		invalidatedAt: v.optional(v.number()),
		failureReason: v.optional(impersonationFailureReasonValidator),
		invalidationReason: v.optional(
			impersonationSessionInvalidationReasonValidator,
		),
		requestId: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		ipHash: v.optional(v.string()),
	})
		.index("by_actor_and_subject_and_status_and_updated_at", [
			"actorClerkUserId",
			"subjectClerkUserId",
			"status",
			"updatedAt",
		])
		.index("by_actor_clerk_user_id_and_updated_at", [
			"actorClerkUserId",
			"updatedAt",
		])
		.index("by_subject_clerk_user_id_and_status_and_updated_at", [
			"subjectClerkUserId",
			"status",
			"updatedAt",
		])
		.index("by_status_and_expires_at", ["status", "expiresAt"]),
	impersonationAuditEvents: defineTable({
		sessionId: v.id("impersonationSessions"),
		eventType: impersonationAuditEventTypeValidator,
		actionId: v.string(),
		result: impersonationAuditResultValidator,
		actorClerkUserId: v.string(),
		actorEmail: v.string(),
		subjectClerkUserId: v.string(),
		subjectEmail: v.optional(v.string()),
		changedRecordIds: v.optional(v.array(v.string())),
		blockReason: v.optional(impersonationBlockReasonValidator),
		failureReason: v.optional(impersonationFailureReasonValidator),
		requestId: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		ipHash: v.optional(v.string()),
		setupIntegrityIssues: v.array(impersonationSetupIntegrityIssueValidator),
		createdAt: v.number(),
	})
		.index("by_session_id_and_created_at", ["sessionId", "createdAt"])
		.index("by_result_and_created_at", ["result", "createdAt"])
		.index("by_event_type_and_created_at", ["eventType", "createdAt"]),
	lessonStates: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		curriculumVersion: v.optional(v.number()),
		lessonKey: v.optional(v.string()),
		lessonId: v.optional(v.string()),
		blockId: v.union(
			v.literal("CEO"),
			v.literal("DESIGN"),
			v.literal("BUILD"),
			v.literal("SHIP"),
		),
		status: v.union(
			v.literal("not_started"),
			v.literal("in_progress"),
			v.literal("completed"),
		),
		artifactKey: v.string(),
		artifactType: v.union(
			v.literal("text"),
			v.literal("table"),
			v.literal("board"),
			v.literal("image"),
			v.literal("images"),
			v.literal("video"),
			v.literal("checklist"),
			v.literal("brief"),
			v.literal("link"),
			v.literal("mixed"),
		),
		fieldValues: fieldValuesValidator,
		startedAt: v.number(),
		updatedAt: v.number(),
		lastViewedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
	})
		.index("by_clerk_user_id_and_status", ["clerkUserId", "status"])
		.index("by_clerk_user_id_and_artifact_key", ["clerkUserId", "artifactKey"]),
	codexConnections: defineTable({
		clerkUserId: v.string(),
		authMode: v.union(v.literal("managed_chatgpt")),
		accountId: v.optional(v.string()),
		planType: v.optional(v.string()),
		connectedAt: v.optional(v.number()),
		status: v.union(
			v.literal("connecting"),
			v.literal("connected"),
			v.literal("disconnected"),
			v.literal("error"),
		),
		lastRateLimitSnapshot: v.optional(codexRateLimitSnapshotsByIdValidator),
		updatedAt: v.number(),
	})
		.index("by_clerk_user_id", ["clerkUserId"])
		.index("by_clerk_user_id_and_status", ["clerkUserId", "status"]),
	codexRuns: defineTable({
		userId: v.string(),
		lessonId: v.optional(v.string()),
		templateId: v.string(),
		status: v.union(v.literal("success"), v.literal("error")),
		latencyMs: v.optional(v.number()),
		errorCode: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_user_id", ["userId"])
		.index("by_user_id_and_template_id", ["userId", "templateId"]),
	supportVisitors: defineTable({
		sessionTokenHash: v.string(),
		status: supportVisitorStatusValidator,
		visitorKind: supportVisitorKindValidator,
		clerkUserId: v.optional(v.string()),
		firstSeenAt: v.number(),
		lastSeenAt: v.number(),
		lastPagePath: v.string(),
	})
		.index("by_session_token_hash", ["sessionTokenHash"])
		.index("by_clerk_user_id_and_last_seen_at", ["clerkUserId", "lastSeenAt"]),
	supportThreads: defineTable({
		visitorId: v.id("supportVisitors"),
		supportId: v.string(),
		status: supportThreadStatusValidator,
		entrySurface: v.string(),
		pagePath: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
		lastMessageAt: v.number(),
		lastVisitorMessageAt: v.optional(v.number()),
		leadStatus: v.optional(supportThreadLeadStatusValidator),
		pendingVisitorMessageCount: v.number(),
		telegramChatId: v.optional(v.string()),
		telegramMessageThreadId: v.optional(v.number()),
		telegramHeaderMessageId: v.optional(v.number()),
		closedAt: v.optional(v.number()),
		idleCloseAfter: v.number(),
		retainUntil: v.optional(v.number()),
		purgeAfter: v.optional(v.number()),
		purgedAt: v.optional(v.number()),
		telegramTopicCleanupStatus: v.optional(
			supportTelegramTopicCleanupStatusValidator,
		),
		telegramTopicCleanupAttemptedAt: v.optional(v.number()),
		telegramTopicCleanupFailureReason: v.optional(v.string()),
	})
		.index("by_visitor_id_and_status", ["visitorId", "status"])
		.index("by_support_id", ["supportId"])
		.index("by_telegram_chat_id_and_message_thread_id", [
			"telegramChatId",
			"telegramMessageThreadId",
		])
		.index("by_status_and_idle_close_after", ["status", "idleCloseAfter"])
		.index("by_status_and_purge_after", ["status", "purgeAfter"])
		.index("by_telegram_topic_cleanup_status_and_updated_at", [
			"telegramTopicCleanupStatus",
			"updatedAt",
		]),
	supportMessages: defineTable({
		threadId: v.id("supportThreads"),
		visitorId: v.id("supportVisitors"),
		source: supportMessageSourceValidator,
		body: v.optional(v.string()),
		attachmentKind: v.optional(supportAttachmentKindValidator),
		attachmentStorageId: v.optional(v.id("_storage")),
		attachmentFileName: v.optional(v.string()),
		attachmentContentType: v.optional(v.string()),
		attachmentSize: v.optional(v.number()),
		attachmentPurgedAt: v.optional(v.number()),
		createdAt: v.number(),
		deliveryStatus: supportDeliveryStatusValidator,
		deliveryAttemptCount: v.number(),
		lastDeliveryAttemptAt: v.optional(v.number()),
		lastDeliveryError: v.optional(v.string()),
		deliveryFailureClass: v.optional(supportDeliveryFailureClassValidator),
		telegramMessageId: v.optional(v.number()),
		telegramUpdateId: v.optional(v.number()),
		telegramOperatorUserId: v.optional(v.number()),
		bodyPurgedAt: v.optional(v.number()),
	})
		.index("by_thread_id_and_created_at", ["threadId", "createdAt"])
		.index("by_thread_id_and_telegram_message_id", [
			"threadId",
			"telegramMessageId",
		])
		.index("by_delivery_status_and_created_at", [
			"deliveryStatus",
			"createdAt",
		]),
	supportOperatorActions: defineTable({
		threadId: v.id("supportThreads"),
		actionType: supportOperatorActionTypeValidator,
		status: supportOperatorActionStatusValidator,
		operatorTelegramUserId: v.number(),
		telegramCallbackQueryId: v.string(),
		telegramUpdateId: v.number(),
		sourceMessageId: v.optional(v.id("supportMessages")),
		customerVisibleMessageId: v.optional(v.id("supportMessages")),
		aiDraftGenerationStatus: v.optional(
			supportAiDraftGenerationStatusValidator,
		),
		generatedOutput: v.optional(v.string()),
		generatedOutputSource: v.optional(supportGeneratedOutputSourceValidator),
		generatedOutputModel: v.optional(v.string()),
		generatedOutputPurgedAt: v.optional(v.number()),
		generationFailureReason: v.optional(v.string()),
		operatorNoteDeliveryStatus: v.optional(
			supportOperatorNoteDeliveryStatusValidator,
		),
		operatorNoteTelegramMessageId: v.optional(v.number()),
		operatorNoteDeliveryFailureReason: v.optional(v.string()),
		draftDecisionStatus: v.optional(supportDraftDecisionStatusValidator),
		draftDecisionAt: v.optional(v.number()),
		draftDecisionTelegramUpdateId: v.optional(v.number()),
		failureReason: v.optional(v.string()),
		createdAt: v.number(),
		completedAt: v.optional(v.number()),
	})
		.index("by_thread_id_and_created_at", ["threadId", "createdAt"])
		.index("by_telegram_callback_query_id", ["telegramCallbackQueryId"])
		.index("by_operator_note_delivery_status_and_created_at", [
			"operatorNoteDeliveryStatus",
			"createdAt",
		]),
	supportRateLimitBuckets: defineTable({
		bucketKey: v.string(),
		windowStartedAt: v.number(),
		messageCount: v.number(),
		updatedAt: v.number(),
	})
		.index("by_bucket_key", ["bucketKey"])
		.index("by_updated_at", ["updatedAt"]),
	errorEvents: defineTable({
		fingerprint: v.string(),
		fingerprintKey: v.string(),
		source: observabilitySourceValidator,
		severity: observabilitySeverityValidator,
		message: v.string(),
		code: v.optional(v.union(v.string(), v.null())),
		requestId: v.optional(v.union(v.string(), v.null())),
		pathname: v.optional(v.union(v.string(), v.null())),
		userId: v.optional(v.union(v.string(), v.null())),
		environment: v.string(),
		stack: v.optional(v.union(v.string(), v.null())),
		details: v.optional(v.union(v.string(), v.null())),
		occurrenceCount: v.number(),
		firstSeenAt: v.number(),
		lastSeenAt: v.number(),
		alertStatus: observabilityAlertStatusValidator,
		alertCount: v.number(),
		lastAlertAt: v.optional(v.number()),
		telegramMessageId: v.optional(v.number()),
		lastAlertError: v.optional(v.string()),
	}).index("by_fingerprint_key", ["fingerprintKey"]),
	incidents: defineTable({
		product: v.string(),
		fingerprint: v.string(),
		fingerprintKey: v.string(),
		source: incidentSourceValidator,
		surface: incidentSurfaceValidator,
		severity: incidentSeverityValidator,
		status: incidentStatusValidator,
		title: v.string(),
		summary: v.string(),
		code: v.optional(v.union(v.string(), v.null())),
		requestId: v.optional(v.union(v.string(), v.null())),
		pathname: v.optional(v.union(v.string(), v.null())),
		userId: v.optional(v.union(v.string(), v.null())),
		externalEventId: v.optional(v.union(v.string(), v.null())),
		deploymentId: v.optional(v.union(v.string(), v.null())),
		nativeUrl: v.optional(v.union(v.string(), v.null())),
		logsUrl: v.optional(v.union(v.string(), v.null())),
		nextAction: v.optional(v.union(v.string(), v.null())),
		environment: incidentEnvironmentValidator,
		stack: v.optional(v.union(v.string(), v.null())),
		details: v.optional(v.union(v.string(), v.null())),
		occurrenceCount: v.number(),
		firstSeenAt: v.number(),
		lastSeenAt: v.number(),
		deliveryStatus: incidentDeliveryStatusValidator,
		deliveryCount: v.number(),
		lastDeliveryAt: v.optional(v.number()),
		telegramMessageId: v.optional(v.number()),
		telegramThreadId: v.optional(v.number()),
		lastDeliveryError: v.optional(v.string()),
		latestOccurrenceId: v.optional(v.id("incidentOccurrences")),
	}).index("by_fingerprint_key", ["fingerprintKey"]),
	incidentOccurrences: defineTable({
		incidentId: v.id("incidents"),
		product: v.string(),
		fingerprint: v.string(),
		fingerprintKey: v.string(),
		source: incidentSourceValidator,
		surface: incidentSurfaceValidator,
		severity: incidentSeverityValidator,
		title: v.string(),
		summary: v.string(),
		code: v.optional(v.union(v.string(), v.null())),
		requestId: v.optional(v.union(v.string(), v.null())),
		pathname: v.optional(v.union(v.string(), v.null())),
		userId: v.optional(v.union(v.string(), v.null())),
		externalEventId: v.optional(v.union(v.string(), v.null())),
		deploymentId: v.optional(v.union(v.string(), v.null())),
		nativeUrl: v.optional(v.union(v.string(), v.null())),
		logsUrl: v.optional(v.union(v.string(), v.null())),
		nextAction: v.optional(v.union(v.string(), v.null())),
		environment: incidentEnvironmentValidator,
		stack: v.optional(v.union(v.string(), v.null())),
		details: v.optional(v.union(v.string(), v.null())),
		occurrenceNumber: v.number(),
		occurredAt: v.number(),
	})
		.index("by_incident_id_and_occurred_at", ["incidentId", "occurredAt"])
		.index("by_fingerprint_key_and_occurred_at", [
			"fingerprintKey",
			"occurredAt",
		]),
});
