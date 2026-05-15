import { describe, expect, it } from "vitest";

import { isSignedInWorkspaceLandingUrl } from "../e2e/auth-bootstrap-url";

describe("isSignedInWorkspaceLandingUrl", () => {
	it("accepts the canonical Starter generate-codebase route", () => {
		expect(
			isSignedInWorkspaceLandingUrl(
				new URL("https://www.man-meets-ai.com/starter/generate-codebase"),
			),
		).toBe(true);
	});

	it("keeps sign-in routes outside the authenticated workspace landing set", () => {
		expect(
			isSignedInWorkspaceLandingUrl(
				new URL(
					"https://www.man-meets-ai.com/sign-in?redirect_url=%2Fgenerate-codebase",
				),
			),
		).toBe(false);
	});
});
