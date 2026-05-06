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
				"apps/web/scripts/verify-dev-stripe-card-payment.mjs",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(".github/workflows/dev-staging-payment-proof.yml"),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"scripts/release/lib/billing-integration-step-planner.mjs",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/platform/billing/checkout/checkout-session.ts",
			),
		).toBe(true);
		expect(isBillingSensitivePath("apps/web/config/product.ts")).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/_components/home-page/sections/home-page-checkout-cta.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-cta-bar.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/_components/home-page/sections/hero-sections.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/blog/_components/blog-post-promo.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-form.tsx",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/(identity)/_components/checkout-email-handoff/use-checkout-email-handoff-flow.ts",
			),
		).toBe(true);
		expect(
			isBillingSensitivePath(
				"apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx",
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
			isConvexSensitivePath(
				"apps/web/platform/billing/checkout/checkout-session-recovery.ts",
			),
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
