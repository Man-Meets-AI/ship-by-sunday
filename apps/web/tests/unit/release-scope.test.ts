import { describe, expect, it } from "vitest";

import {
	classifyReleaseScope,
	isBillingSensitivePath,
	isConvexSensitivePath,
} from "../../../../scripts/release/lib/release-scope.mjs";

describe("release scope classifier", () => {
	it("marks checkout and billing proof files as billing sensitive", () => {
		expect(
			isBillingSensitivePath("apps/web/app/api/stripe/checkout/route.ts"),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/scripts/verify-hosted-stripe-checkout.mjs",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"scripts/release/lib/billing-integration-step-planner.mjs",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath("scripts/release/run-release-proof.mjs"),
		).toBe(true);
		expect(
			isBillingSensitivePath("scripts/release/prepare-release-personas.mjs"),
		).toBe(true);
	});

	it("marks convex files as convex sensitive", () => {
		expect(isConvexSensitivePath("apps/web/convex/schema.ts")).toBe(true);
		expect(
			isConvexSensitivePath("apps/web/convex/checkoutClaimsActions.ts"),
		).toBe(true);
		expect(
			isConvexSensitivePath("apps/web/features/checkout/server/foo.ts"),
		).toBe(false);
		expect(
			isConvexSensitivePath("scripts/release/detect-release-scope.mjs"),
		).toBe(true);
	});

	it("classifies billing and convex changes independently", () => {
		const summary = classifyReleaseScope([
			"apps/web/app/api/stripe/checkout/route.ts",
			"apps/web/convex/schema.ts",
			"README.md",
		]);

		expect(summary.billingSensitive).toBe(true);
		expect(summary.convexSensitive).toBe(true);
		expect(summary.billingSensitiveFiles).toContain(
			"apps/web/app/api/stripe/checkout/route.ts",
		);
		expect(summary.convexSensitiveFiles).toContain("apps/web/convex/schema.ts");
	});
});
