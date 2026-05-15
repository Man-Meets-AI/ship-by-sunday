import { v } from "convex/values";

import { supportModeIntegrityWarningValues } from "../../src/platform/admin-impersonation/status";

export const impersonationSessionStatusValues = [
	"starting",
	"active",
	"stopped",
	"expired",
	"start_failed",
	"invalidated",
] as const;
export const impersonationAuditResultValues = [
	"success",
	"blocked",
	"failed",
] as const;
export const impersonationAuditEventTypeValues = [
	"session_started",
	"session_stopped",
	"session_expired",
	"session_invalidated",
	"write_attempted",
	"download_attempted",
	"external_action_blocked",
	"start_failed",
] as const;
export const impersonationSetupIntegrityIssueValues =
	supportModeIntegrityWarningValues;
export const impersonationBlockReasonValues = [
	"support_session_expired",
	"support_session_mismatch",
	"unsupported_clerk_dashboard_impersonation",
	"unclassified_write",
	"external_side_effect_blocked",
	"destructive_action_blocked",
	"customer_repository_operation_blocked",
	"customer_notification_blocked",
	"billing_action_blocked",
	"secret_access_blocked",
] as const;
export const impersonationFailureReasonValues = [
	"clerk_actor_token_failed",
	"session_cookie_failed",
	"session_handoff_failed",
	"convex_session_create_failed",
	"convex_audit_write_failed",
	"integrity_check_failed",
	"unexpected_error",
] as const;
export const impersonationSessionInvalidationReasonValues = [
	"feature_disabled",
	"session_mismatch",
	"unsupported_clerk_dashboard_impersonation",
] as const;

export const impersonationSessionStatusValidator = v.union(
	v.literal("starting"),
	v.literal("active"),
	v.literal("stopped"),
	v.literal("expired"),
	v.literal("start_failed"),
	v.literal("invalidated"),
);
export const impersonationAuditResultValidator = v.union(
	v.literal("success"),
	v.literal("blocked"),
	v.literal("failed"),
);
export const impersonationAuditEventTypeValidator = v.union(
	v.literal("session_started"),
	v.literal("session_stopped"),
	v.literal("session_expired"),
	v.literal("session_invalidated"),
	v.literal("write_attempted"),
	v.literal("download_attempted"),
	v.literal("external_action_blocked"),
	v.literal("start_failed"),
);
export const impersonationSetupIntegrityIssueValidator = v.union(
	v.literal("missing_product_access_grant"),
	v.literal("missing_workspace_project"),
	v.literal("checkout_claim_mismatch"),
	v.literal("integrity_check_failed"),
);
export const impersonationBlockReasonValidator = v.union(
	v.literal("support_session_expired"),
	v.literal("support_session_mismatch"),
	v.literal("unsupported_clerk_dashboard_impersonation"),
	v.literal("unclassified_write"),
	v.literal("external_side_effect_blocked"),
	v.literal("destructive_action_blocked"),
	v.literal("customer_repository_operation_blocked"),
	v.literal("customer_notification_blocked"),
	v.literal("billing_action_blocked"),
	v.literal("secret_access_blocked"),
);
export const impersonationFailureReasonValidator = v.union(
	v.literal("clerk_actor_token_failed"),
	v.literal("session_cookie_failed"),
	v.literal("session_handoff_failed"),
	v.literal("convex_session_create_failed"),
	v.literal("convex_audit_write_failed"),
	v.literal("integrity_check_failed"),
	v.literal("unexpected_error"),
);
export const impersonationSessionInvalidationReasonValidator = v.union(
	v.literal("feature_disabled"),
	v.literal("session_mismatch"),
	v.literal("unsupported_clerk_dashboard_impersonation"),
);
export const supportModeStatusStateValidator = v.union(
	v.literal("disabled"),
	v.literal("misconfigured"),
	v.literal("not_admin"),
	v.literal("normal"),
	v.literal("active"),
	v.literal("expired"),
	v.literal("stopped"),
	v.literal("invalid_mismatch"),
	v.literal("kill_switch_disabled"),
	v.literal("unsupported_clerk_dashboard_impersonation"),
);

export const supportModeStatusValidator = v.object({
	state: supportModeStatusStateValidator,
	startEligible: v.boolean(),
	stopEligible: v.boolean(),
	customerEmail: v.union(v.string(), v.null()),
	reason: v.union(v.string(), v.null()),
	timeRemainingMs: v.union(v.number(), v.null()),
	integrityWarnings: v.array(impersonationSetupIntegrityIssueValidator),
});

export const impersonationSessionHistoryItemValidator = v.object({
	sessionId: v.id("impersonationSessions"),
	customerEmail: v.union(v.string(), v.null()),
	reason: v.string(),
	status: impersonationSessionStatusValidator,
	startedAt: v.number(),
	updatedAt: v.number(),
	stoppedAt: v.union(v.number(), v.null()),
	failedAt: v.union(v.number(), v.null()),
	invalidatedAt: v.union(v.number(), v.null()),
	expiresAt: v.number(),
	blockedEventCount: v.number(),
	eventCount: v.number(),
	integrityWarnings: v.array(impersonationSetupIntegrityIssueValidator),
});
