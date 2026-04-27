import { describe, expect, it } from "vitest";

import {
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
			"/blueprint",
		);
		expect(getSafeRedirectPath("//example.com/settings")).toBe("/blueprint");
	});

	it("builds task routes that preserve the redirect target", () => {
		expect(getSessionTaskHref("reset-password", "/settings")).toBe(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("returns null for unknown Clerk session tasks", () => {
		expect(getSessionTaskHref("setup-mfa", "/settings")).toBeNull();
	});

	it("uses the sanitized redirect target for task completion", () => {
		expect(getTaskRedirectUrlComplete("/settings")).toBe("/settings");
		expect(getTaskRedirectUrlComplete("https://example.com/settings")).toBe(
			"/blueprint",
		);
	});
});
