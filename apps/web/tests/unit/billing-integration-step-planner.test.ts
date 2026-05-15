import { describe, expect, it } from "vitest";

import {
	buildBillingIntegrationSteps,
	isProductionBillingTarget,
} from "../../../../scripts/release/lib/billing-integration-step-planner.mjs";

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
					"bun run --cwd apps/web stripe:hosted:verify -- --offer=starter",
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

	it("uses the paid card verifier on non-production hosted targets", () => {
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
					"bun run --cwd apps/web stripe:hosted:verify:dev-card -- --base-url=https://dev.man-meets-ai.com --offer=starter",
			),
		).toBe(true);
		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run release:personas:prepare -- --proof=billing_integration",
			),
		).toBe(false);
		expect(
			steps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web test:e2e:sandbox:billing-integration",
			),
		).toBe(false);
	});

	it("passes the selected Workers offer to hosted billing proofs", () => {
		const productionSteps = buildBillingIntegrationSteps({
			authenticatedBrowserEnv: {
				PLAYWRIGHT_BASE_URL: "https://www.man-meets-ai.com",
			},
			billingProofOfferId: "workers",
			isLocalBillingTarget: false,
			personaPrepareEnv: {
				PLAYWRIGHT_BASE_URL: "https://www.man-meets-ai.com",
			},
			slug: "prod-workers-billing-123",
			targetUrl: "https://www.man-meets-ai.com",
		});
		const devSteps = buildBillingIntegrationSteps({
			authenticatedBrowserEnv: {
				PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
			},
			billingProofOfferId: "workers",
			isLocalBillingTarget: false,
			personaPrepareEnv: {
				PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
			},
			slug: "dev-workers-billing-123",
			targetUrl: "https://dev.man-meets-ai.com",
		});

		expect(
			productionSteps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web stripe:hosted:verify -- --offer=workers",
			),
		).toBe(true);
		expect(
			devSteps.some(
				(step) =>
					step.command.join(" ") ===
					"bun run --cwd apps/web stripe:hosted:verify:dev-card -- --base-url=https://dev.man-meets-ai.com --offer=workers",
			),
		).toBe(true);
	});
});
