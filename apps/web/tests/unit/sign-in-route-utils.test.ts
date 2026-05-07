import { describe, expect, it } from "vitest";

import {
	buildClearPendingCheckoutSessionHref,
	getSessionTaskHref,
	getSafeRedirectPath,
	getTaskRedirectUrlComplete,
	isCheckoutWelcomeRedirectPath,
} from "@/platform/auth/auth-route-utils";

describe("sign-in route utils", () => {
	it("keeps valid internal redirect paths", () => {
		expect(getSafeRedirectPath("/settings")).toBe("/settings");
	});

	it("falls back for invalid redirect paths", () => {
		expect(getSafeRedirectPath("https://example.com/settings")).toBe(
			"/workspace/choose",
		);
		expect(getSafeRedirectPath("//example.com/settings")).toBe(
			"/workspace/choose",
		);
	});

	it("builds task routes that preserve the redirect target", () => {
		expect(getSessionTaskHref("reset-password", "/settings")).toBe(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("builds cookie-clearing checkout recovery routes with a safe redirect", () => {
		expect(buildClearPendingCheckoutSessionHref("/codebase")).toBe(
			"/checkout/clear-pending?redirect_url=%2Fcodebase",
		);
		expect(
			buildClearPendingCheckoutSessionHref("https://example.com/owned"),
		).toBe("/checkout/clear-pending?redirect_url=%2Fworkspace%2Fchoose");
	});

	it("detects the immediate post-checkout workspace welcome redirect", () => {
		expect(
			isCheckoutWelcomeRedirectPath("/workspace/choose?welcome=checkout"),
		).toBe(true);
		expect(
			isCheckoutWelcomeRedirectPath("/workspace/choose?welcome=returning"),
		).toBe(false);
		expect(isCheckoutWelcomeRedirectPath(null)).toBe(false);
		expect(
			isCheckoutWelcomeRedirectPath("https://example.com/workspace/choose"),
		).toBe(false);
		expect(isCheckoutWelcomeRedirectPath("/workspace/choose")).toBe(false);
		expect(isCheckoutWelcomeRedirectPath("/checkout/success")).toBe(false);
	});

	it("returns null for unknown Clerk session tasks", () => {
		expect(getSessionTaskHref("setup-mfa", "/settings")).toBeNull();
	});

	it("uses the sanitized redirect target for task completion", () => {
		expect(getTaskRedirectUrlComplete("/settings")).toBe("/settings");
		expect(getTaskRedirectUrlComplete("https://example.com/settings")).toBe(
			"/workspace/choose",
		);
	});
});
