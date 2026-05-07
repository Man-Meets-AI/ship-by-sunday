import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("support session cookie", () => {
	it("creates an HttpOnly host cookie when the request has no support session", async () => {
		const { getSupportSessionCookie, SUPPORT_SESSION_COOKIE_NAME } =
			await import("@/app/api/support/_server/support-session-cookie");

		const supportSessionCookie = getSupportSessionCookie(
			new Request("https://example.test/"),
		);

		expect(supportSessionCookie.sessionToken).toHaveLength(64);
		expect(supportSessionCookie.setCookieHeader).toContain(
			`${SUPPORT_SESSION_COOKIE_NAME}=`,
		);
		expect(supportSessionCookie.setCookieHeader).toContain("HttpOnly");
		expect(supportSessionCookie.setCookieHeader).toContain("Secure");
		expect(supportSessionCookie.setCookieHeader).toContain("SameSite=Lax");
		expect(supportSessionCookie.setCookieHeader).toContain("Path=/");
		expect(supportSessionCookie.setCookieHeader).not.toContain("Domain=");
	});

	it("reuses an existing valid support session without refreshing it", async () => {
		const { getSupportSessionCookie, SUPPORT_SESSION_COOKIE_NAME } =
			await import("@/app/api/support/_server/support-session-cookie");
		const existingToken = "a".repeat(64);

		const supportSessionCookie = getSupportSessionCookie(
			new Request("https://example.test/", {
				headers: {
					cookie: `${SUPPORT_SESSION_COOKIE_NAME}=${existingToken}`,
				},
			}),
		);

		expect(supportSessionCookie.sessionToken).toBe(existingToken);
		expect(supportSessionCookie.setCookieHeader).toBeNull();
	});

	it("replaces a malformed support cookie", async () => {
		const { getSupportSessionCookie, SUPPORT_SESSION_COOKIE_NAME } =
			await import("@/app/api/support/_server/support-session-cookie");

		const supportSessionCookie = getSupportSessionCookie(
			new Request("https://example.test/", {
				headers: {
					cookie: `${SUPPORT_SESSION_COOKIE_NAME}=%`,
				},
			}),
		);

		expect(supportSessionCookie.sessionToken).toHaveLength(64);
		expect(supportSessionCookie.setCookieHeader).toContain(
			`${SUPPORT_SESSION_COOKIE_NAME}=`,
		);
	});
});
