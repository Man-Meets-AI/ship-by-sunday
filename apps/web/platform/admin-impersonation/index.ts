export {
	ADMIN_IMPERSONATION_EMAILS_ENV,
	ADMIN_IMPERSONATION_ENABLED_ENV,
	classifyAdminImpersonationAuthority,
	parseAdminImpersonationEmails,
	readAdminImpersonationConfig,
	type AdminImpersonationAuthority,
	type AdminImpersonationConfig,
	type AdminImpersonationIdentity,
} from "./config";
export {
	createSupportModeStatus,
	type SupportModeIntegrityWarning,
	type SupportModeStatus,
	type SupportModeStatusState,
} from "./status";
