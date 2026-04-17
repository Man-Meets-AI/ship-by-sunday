import { describe, expect, it } from "vitest";

import {
	buildBillingIntegrationSteps,
	isProductionBillingTarget,
} from "../../../../qa/scripts/lib/billing-integration-step-planner.mjs";

describe("billing integration step planner", () => {
	it("treats www.man-meets-ai.com as the production billing target", () => {
		expect(isProductionBillingTarget("https://www.man-meets-ai.com")).toBe(
			true,
		);
		expect(isProductionBillingTarget("https://dev.man-meets-ai.com")).toBe(
			false,
		);
	});

	it("uses the hosted verifier instead of the sandbox browser pack on production", () => {
		const steps = buildBillingIntegrationSteps({
			authenticatedBrowserEnv: {
				PLAYWRIGHT_BASE_URL: "https://www.man-meets-ai.com",
			},
			isLocalBillingTarget: false,
			personaPrepareEnv: {
				PLAYWRIGHT_BASE_URL: "https://www.man-meets-ai.com",
			},
			slug: "prod-billing-123",
			targetUrl: "https://www.man-meets-ai.com",
		});

		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web stripe:hosted:verify",
			),
		).toBe(true);
		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web test:e2e:sandbox:billing-integration",
			),
		).toBe(false);
	});

	it("uses the hosted verifier on non-production hosted targets", () => {
		const steps = buildBillingIntegrationSteps({
			authenticatedBrowserEnv: {
				PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
			},
			isLocalBillingTarget: false,
			personaPrepareEnv: {
				PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
			},
			slug: "dev-billing-123",
			targetUrl: "https://dev.man-meets-ai.com",
		});

		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"node apps/web/scripts/verify-hosted-stripe-checkout.mjs --base-url=https://dev.man-meets-ai.com",
			),
		).toBe(true);
		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web test:e2e:sandbox:billing-integration",
			),
		).toBe(false);
	});
});
