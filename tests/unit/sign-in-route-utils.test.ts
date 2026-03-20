import { describe, expect, it } from "vitest";

import {
	buildSessionTaskHref,
	getSafeRedirectPath,
	getTaskRedirectUrlComplete,
} from "@/features/auth/sign-in/sign-in-route-utils";

describe("sign-in route utils", () => {
	it("keeps valid internal redirect paths", () => {
		expect(getSafeRedirectPath("/settings")).toBe("/settings");
	});

	it("falls back for invalid redirect paths", () => {
		expect(getSafeRedirectPath("https://example.com/settings")).toBe("/mission");
		expect(getSafeRedirectPath("//example.com/settings")).toBe("/mission");
	});

	it("builds task routes that preserve the redirect target", () => {
		expect(buildSessionTaskHref("setup-mfa", "/settings")).toBe(
			"/session-tasks/setup-mfa?redirect_url=%2Fsettings",
		);
	});

	it("uses the sanitized redirect target for task completion", () => {
		expect(getTaskRedirectUrlComplete("/settings")).toBe("/settings");
		expect(getTaskRedirectUrlComplete("https://example.com/settings")).toBe(
			"/mission",
		);
	});
});
