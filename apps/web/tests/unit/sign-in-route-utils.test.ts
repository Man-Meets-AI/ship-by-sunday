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

	it("normalizes duplicate redirect query params to the first value", () => {
		expect(getSafeRedirectPath(["/settings", "https://example.com"])).toBe(
			"/settings",
		);
		expect(getSafeRedirectPath(["https://example.com", "/settings"])).toBe(
			"/home",
		);
	});

	it("falls back for invalid redirect paths", () => {
		expect(getSafeRedirectPath("https://example.com/settings")).toBe("/home");
		expect(getSafeRedirectPath("//example.com/settings")).toBe("/home");
		expect(getSafeRedirectPath("/\\\\example.com/settings")).toBe("/home");
		expect(getSafeRedirectPath("/%5C%5Cexample.com/settings")).toBe("/home");
		expect(getSafeRedirectPath("/%2F%2Fexample.com/settings")).toBe("/home");
		expect(getSafeRedirectPath("/settings\n/evil")).toBe("/home");
	});

	it("builds task routes that preserve the redirect target", () => {
		expect(getSessionTaskHref("reset-password", "/settings")).toBe(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("builds cookie-clearing checkout recovery routes with a safe redirect", () => {
		expect(buildClearPendingCheckoutSessionHref("/generate-codebase")).toBe(
			"/checkout/clear-pending?redirect_url=%2Fgenerate-codebase",
		);
		expect(
			buildClearPendingCheckoutSessionHref("https://example.com/owned"),
		).toBe("/checkout/clear-pending?redirect_url=%2Fhome");
	});

	it("detects the immediate post-checkout home welcome redirect", () => {
		expect(isCheckoutWelcomeRedirectPath("/home?welcome=checkout")).toBe(true);
		expect(
			isCheckoutWelcomeRedirectPath("/starter/home?welcome=checkout"),
		).toBe(true);
		expect(
			isCheckoutWelcomeRedirectPath("/workers/setup?welcome=checkout"),
		).toBe(true);
		expect(isCheckoutWelcomeRedirectPath("/home?welcome=returning")).toBe(
			false,
		);
		expect(
			isCheckoutWelcomeRedirectPath("/workers/setup?welcome=returning"),
		).toBe(false);
		expect(isCheckoutWelcomeRedirectPath(null)).toBe(false);
		expect(isCheckoutWelcomeRedirectPath("https://example.com/home")).toBe(
			false,
		);
		expect(isCheckoutWelcomeRedirectPath("/home")).toBe(false);
		expect(isCheckoutWelcomeRedirectPath("/checkout/success")).toBe(false);
	});

	it("returns null for unknown Clerk session tasks", () => {
		expect(getSessionTaskHref("setup-mfa", "/settings")).toBeNull();
	});

	it("uses the sanitized redirect target for task completion", () => {
		expect(getTaskRedirectUrlComplete("/settings")).toBe("/settings");
		expect(getTaskRedirectUrlComplete("https://example.com/settings")).toBe(
			"/home",
		);
	});
});
