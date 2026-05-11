import type {
	impersonationAuditEventTypeValues,
	impersonationAuditResultValues,
	impersonationBlockReasonValues,
	impersonationFailureReasonValues,
	impersonationSessionInvalidationReasonValues,
	impersonationSessionStatusValues,
	impersonationSetupIntegrityIssueValues,
} from "./validators";

export type ImpersonationSessionStatus =
	(typeof impersonationSessionStatusValues)[number];
export type ImpersonationAuditEventType =
	(typeof impersonationAuditEventTypeValues)[number];
export type ImpersonationAuditResult =
	(typeof impersonationAuditResultValues)[number];
export type ImpersonationSetupIntegrityIssue =
	(typeof impersonationSetupIntegrityIssueValues)[number];
export type ImpersonationBlockReason =
	(typeof impersonationBlockReasonValues)[number];
export type ImpersonationFailureReason =
	(typeof impersonationFailureReasonValues)[number];
export type ImpersonationSessionInvalidationReason =
	(typeof impersonationSessionInvalidationReasonValues)[number];
