export const supportModeStatusStateValues = [
	"disabled",
	"misconfigured",
	"not_admin",
	"normal",
	"active",
	"expired",
	"stopped",
	"invalid_mismatch",
	"kill_switch_disabled",
	"unsupported_clerk_dashboard_impersonation",
] as const;

export const supportModeIntegrityWarningValues = [
	"missing_product_access_grant",
	"missing_workspace_project",
	"checkout_claim_mismatch",
	"integrity_check_failed",
] as const;

export type SupportModeStatusState =
	(typeof supportModeStatusStateValues)[number];

export type SupportModeIntegrityWarning =
	(typeof supportModeIntegrityWarningValues)[number];

export type SupportModeStatus = {
	state: SupportModeStatusState;
	startEligible: boolean;
	stopEligible: boolean;
	customerEmail: string | null;
	reason: string | null;
	timeRemainingMs: number | null;
	integrityWarnings: SupportModeIntegrityWarning[];
};

export function createSupportModeStatus(
	input: SupportModeStatus,
): SupportModeStatus {
	return input;
}
