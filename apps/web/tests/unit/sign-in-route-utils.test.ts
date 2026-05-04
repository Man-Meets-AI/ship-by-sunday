import { describe, expect, it } from "vitest";

import {
	buildClearPendingCheckoutSessionHref,
	buildCheckoutEmailHandoffHref,
	buildCheckoutEmailHandoffHrefForSuccessRedirect,
	getCheckoutSessionIdFromSuccessRedirectPath,
	getSessionTaskHref,
	getSafeRedirectPath,
	getTaskRedirectUrlComplete,
} from "@/platform/auth/auth-route-utils";

describe("sign-in route utils", () => {
	it("keeps valid internal redirect paths", () => {
		expect(getSafeRedirectPath("/settings")).toBe("/settings");
	});

	it("falls back for invalid redirect paths", () => {
		expect(getSafeRedirectPath("https://example.com/settings")).toBe(
			"/codebase",
		);
		expect(getSafeRedirectPath("//example.com/settings")).toBe("/codebase");
	});

	it("builds task routes that preserve the redirect target", () => {
		expect(getSessionTaskHref("reset-password", "/settings")).toBe(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("builds checkout email handoff routes without trusting browser email", () => {
		expect(
			buildCheckoutEmailHandoffHref({
				redirectPath: "/checkout/success?session_id=cs_test_123",
				sessionId: "cs_test_123",
			}),
		).toBe(
			"/checkout/email-handoff?session_id=cs_test_123&redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
	});

	it("builds cookie-clearing checkout recovery routes with a safe redirect", () => {
		expect(buildClearPendingCheckoutSessionHref("/codebase")).toBe(
			"/checkout/clear-pending?redirect_url=%2Fcodebase",
		);
		expect(
			buildClearPendingCheckoutSessionHref("https://example.com/owned"),
		).toBe("/checkout/clear-pending?redirect_url=%2Fcodebase");
	});

	it("extracts checkout session ids from safe checkout success redirects", () => {
		expect(
			getCheckoutSessionIdFromSuccessRedirectPath(
				"/checkout/success?session_id=cs_test_123",
			),
		).toBe("cs_test_123");
		expect(getCheckoutSessionIdFromSuccessRedirectPath("/codebase")).toBeNull();
		expect(
			buildCheckoutEmailHandoffHrefForSuccessRedirect(
				"/checkout/success?session_id=cs_test_123",
			),
		).toBe(
			"/checkout/email-handoff?session_id=cs_test_123&redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
	});

	it("returns null for unknown Clerk session tasks", () => {
		expect(getSessionTaskHref("setup-mfa", "/settings")).toBeNull();
	});

	it("uses the sanitized redirect target for task completion", () => {
		expect(getTaskRedirectUrlComplete("/settings")).toBe("/settings");
		expect(getTaskRedirectUrlComplete("https://example.com/settings")).toBe(
			"/codebase",
		);
	});
});
