export const ADMIN_IMPERSONATION_ENABLED_ENV =
	"ADMIN_IMPERSONATION_ENABLED" as const;
export const ADMIN_IMPERSONATION_EMAILS_ENV =
	"ADMIN_IMPERSONATION_EMAILS" as const;

export type AdminImpersonationConfig =
	| {
			state: "disabled";
			enabled: false;
			adminEmails: [];
			issue: null;
	  }
	| {
			state: "misconfigured";
			enabled: false;
			adminEmails: string[];
			issue: "invalid_enabled_value" | "missing_admin_allowlist";
	  }
	| {
			state: "enabled";
			enabled: true;
			adminEmails: string[];
			issue: null;
	  };

export type AdminImpersonationIdentity = {
	subject?: string | null;
	email?: string | null;
	emailVerified?: boolean | null;
};

export type AdminImpersonationAuthority =
	| {
			state: "disabled";
			canStartImpersonation: false;
			issue: null;
	  }
	| {
			state: "misconfigured";
			canStartImpersonation: false;
			issue: "invalid_enabled_value" | "missing_admin_allowlist";
	  }
	| {
			state: "not_admin";
			canStartImpersonation: false;
			issue:
				| "missing_identity"
				| "missing_email"
				| "email_unverified"
				| "email_not_allowlisted";
			clerkUserId: string | null;
			email: string | null;
	  }
	| {
			state: "admin";
			canStartImpersonation: true;
			issue: null;
			clerkUserId: string;
			email: string;
	  };

type RuntimeEnv = Record<string, string | undefined>;

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return undefined;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

export function parseAdminImpersonationEmails(value: string | undefined) {
	const normalizedValue = normalizeEnvValue(value);
	if (!normalizedValue) {
		return [];
	}

	return Array.from(
		new Set(
			normalizedValue
				.split(",")
				.map(normalizeEmail)
				.filter((email) => email.length > 0),
		),
	);
}

export function readAdminImpersonationConfig(
	env: RuntimeEnv = process.env,
): AdminImpersonationConfig {
	const enabledValue = normalizeEnvValue(env[ADMIN_IMPERSONATION_ENABLED_ENV]);
	if (!enabledValue || enabledValue === "false") {
		return {
			state: "disabled",
			enabled: false,
			adminEmails: [],
			issue: null,
		};
	}

	const adminEmails = parseAdminImpersonationEmails(
		env[ADMIN_IMPERSONATION_EMAILS_ENV],
	);

	if (enabledValue !== "true") {
		return {
			state: "misconfigured",
			enabled: false,
			adminEmails,
			issue: "invalid_enabled_value",
		};
	}

	if (adminEmails.length === 0) {
		return {
			state: "misconfigured",
			enabled: false,
			adminEmails,
			issue: "missing_admin_allowlist",
		};
	}

	return {
		state: "enabled",
		enabled: true,
		adminEmails,
		issue: null,
	};
}

export function classifyAdminImpersonationAuthority({
	config,
	identity,
}: {
	config: AdminImpersonationConfig;
	identity: AdminImpersonationIdentity | null | undefined;
}): AdminImpersonationAuthority {
	if (config.state === "disabled") {
		return {
			state: "disabled",
			canStartImpersonation: false,
			issue: null,
		};
	}

	if (config.state === "misconfigured") {
		return {
			state: "misconfigured",
			canStartImpersonation: false,
			issue: config.issue,
		};
	}

	if (!identity?.subject) {
		return {
			state: "not_admin",
			canStartImpersonation: false,
			issue: "missing_identity",
			clerkUserId: null,
			email: null,
		};
	}

	if (!identity.email) {
		return {
			state: "not_admin",
			canStartImpersonation: false,
			issue: "missing_email",
			clerkUserId: identity.subject,
			email: null,
		};
	}

	const normalizedEmail = normalizeEmail(identity.email);
	if (identity.emailVerified !== true) {
		return {
			state: "not_admin",
			canStartImpersonation: false,
			issue: "email_unverified",
			clerkUserId: identity.subject,
			email: normalizedEmail,
		};
	}

	if (!config.adminEmails.includes(normalizedEmail)) {
		return {
			state: "not_admin",
			canStartImpersonation: false,
			issue: "email_not_allowlisted",
			clerkUserId: identity.subject,
			email: normalizedEmail,
		};
	}

	return {
		state: "admin",
		canStartImpersonation: true,
		issue: null,
		clerkUserId: identity.subject,
		email: normalizedEmail,
	};
}
