import {
	classifyAdminImpersonationAuthority,
	readAdminImpersonationConfig,
} from "@/platform/admin-impersonation";

const enabledConfig = readAdminImpersonationConfig({
	ADMIN_IMPERSONATION_ENABLED: "true",
	ADMIN_IMPERSONATION_EMAILS: "me@parkerrex.com",
});

describe("admin impersonation admin authority", () => {
	it("allows only a verified allowlisted admin email", () => {
		expect(
			classifyAdminImpersonationAuthority({
				config: enabledConfig,
				identity: {
					subject: "user_admin",
					email: "Me@ParkerRex.com",
					emailVerified: true,
				},
			}),
		).toEqual({
			state: "admin",
			canStartImpersonation: true,
			issue: null,
			clerkUserId: "user_admin",
			email: "me@parkerrex.com",
		});
	});

	it("rejects unverified admin email claims", () => {
		expect(
			classifyAdminImpersonationAuthority({
				config: enabledConfig,
				identity: {
					subject: "user_admin",
					email: "me@parkerrex.com",
					emailVerified: false,
				},
			}),
		).toMatchObject({
			state: "not_admin",
			canStartImpersonation: false,
			issue: "email_unverified",
		});
	});

	it("rejects signed-in users outside the allowlist", () => {
		expect(
			classifyAdminImpersonationAuthority({
				config: enabledConfig,
				identity: {
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
				},
			}),
		).toMatchObject({
			state: "not_admin",
			canStartImpersonation: false,
			issue: "email_not_allowlisted",
		});
	});

	it("fails closed when the feature is disabled or misconfigured", () => {
		expect(
			classifyAdminImpersonationAuthority({
				config: readAdminImpersonationConfig({}),
				identity: {
					subject: "user_admin",
					email: "me@parkerrex.com",
					emailVerified: true,
				},
			}),
		).toMatchObject({ state: "disabled", canStartImpersonation: false });

		expect(
			classifyAdminImpersonationAuthority({
				config: readAdminImpersonationConfig({
					ADMIN_IMPERSONATION_ENABLED: "true",
				}),
				identity: {
					subject: "user_admin",
					email: "me@parkerrex.com",
					emailVerified: true,
				},
			}),
		).toMatchObject({
			state: "misconfigured",
			canStartImpersonation: false,
		});
	});
});
