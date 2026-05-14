import { makeFunctionReference } from "convex/server";
import { describe, expect, it, vi } from "vitest";

import {
	assertConvexBillingSyncBoundaryReady,
	type ConvexBillingCustomerOwner,
	type ConvexBillingSyncBoundaryArgs,
	requireConvexWebhookMutationSecretForPreflight,
} from "../../scripts/lib/convex-billing-sync-boundary";

const lookupStripeCustomerOwnerFromServer = makeFunctionReference<
	"query",
	ConvexBillingSyncBoundaryArgs,
	ConvexBillingCustomerOwner
>("billing:lookupStripeCustomerOwnerFromServer");

describe("Convex billing sync preflight", () => {
	it("requires a configured shared secret", () => {
		expect(() => requireConvexWebhookMutationSecretForPreflight({})).toThrow(
			"Missing required environment variable: CONVEX_WEBHOOK_MUTATION_SECRET",
		);
	});

	it("rejects too-short shared secrets before calling Convex", () => {
		expect(() =>
			requireConvexWebhookMutationSecretForPreflight({
				CONVEX_WEBHOOK_MUTATION_SECRET: "short",
			}),
		).toThrow("CONVEX_WEBHOOK_MUTATION_SECRET must be at least 32 characters.");
	});

	it("probes the secret-gated Convex lookup boundary with the app secret", async () => {
		const fetchQuery = vi.fn().mockResolvedValue(null);

		await expect(
			assertConvexBillingSyncBoundaryReady({
				env: {
					CONVEX_WEBHOOK_MUTATION_SECRET:
						"convex_webhook_mutation_secret_1234567890",
				},
				fetchQuery,
				functionReference: lookupStripeCustomerOwnerFromServer,
			}),
		).resolves.toMatchObject({
			functionName: "api.billing.lookupStripeCustomerOwnerFromServer",
			ok: true,
		});
		expect(fetchQuery).toHaveBeenCalledWith(
			lookupStripeCustomerOwnerFromServer,
			{
				convexWebhookMutationSecret:
					"convex_webhook_mutation_secret_1234567890",
				stripeCustomerId: "cus_billing_sync_preflight_missing_customer",
			},
		);
	});

	it("fails closed when Convex rejects the shared secret", async () => {
		const fetchQuery = vi
			.fn()
			.mockRejectedValue(new Error("Unauthorized billing sync call."));

		await expect(
			assertConvexBillingSyncBoundaryReady({
				env: {
					CONVEX_WEBHOOK_MUTATION_SECRET:
						"convex_webhook_mutation_secret_1234567890",
				},
				fetchQuery,
				functionReference: lookupStripeCustomerOwnerFromServer,
			}),
		).rejects.toThrow("Unauthorized billing sync call.");
	});
});
