import {
	parseAdminImpersonationEmails,
	readAdminImpersonationConfig,
} from "@/platform/admin-impersonation";

describe("admin impersonation config", () => {
	it("defaults to disabled without a permissive local fallback", () => {
		expect(readAdminImpersonationConfig({})).toEqual({
			state: "disabled",
			enabled: false,
			adminEmails: [],
			issue: null,
		});
	});

	it("requires an allowlist when the feature is enabled", () => {
		expect(
			readAdminImpersonationConfig({
				ADMIN_IMPERSONATION_ENABLED: "true",
			}),
		).toEqual({
			state: "misconfigured",
			enabled: false,
			adminEmails: [],
			issue: "missing_admin_allowlist",
		});
	});

	it("treats invalid enabled values as misconfiguration", () => {
		expect(
			readAdminImpersonationConfig({
				ADMIN_IMPERSONATION_ENABLED: "yes",
				ADMIN_IMPERSONATION_EMAILS: "me@parkerrex.com",
			}),
		).toMatchObject({
			state: "misconfigured",
			issue: "invalid_enabled_value",
		});
	});

	it("normalizes the admin email allowlist", () => {
		expect(
			parseAdminImpersonationEmails(
				" Me@ParkerRex.com, ,support@example.com,me@parkerrex.com ",
			),
		).toEqual(["me@parkerrex.com", "support@example.com"]);
	});
});
