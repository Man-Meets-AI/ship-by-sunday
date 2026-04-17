import { convexTest } from "convex-test";

import { internal } from "@/convex/_generated/api";
import schema from "@/convex/schema";

const convexModules = import.meta.glob("../../../convex/**/*.*s");

describe("checkout access contract", () => {
	it("claims a pending Stripe checkout for the verified buyer and grants access", async () => {
		const testConvex = convexTest(schema, convexModules);

		await testConvex.mutation(
			internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe,
			{
				stripeCheckoutSessionId: "cs_test_123",
				checkoutEmail: "buyer@example.com",
				courseSlug: "ship-by-sunday",
				paymentStatus: "paid",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				stripeEventId: "evt_123",
				stripeEventType: "checkout.session.completed",
			},
		);

		const claimResult = await testConvex
			.withIdentity({
				subject: "user_123",
				email: "buyer@example.com",
				emailVerified: true,
			})
			.mutation(internal.checkoutClaims.claimPendingCheckoutClaim, {
				stripeCheckoutSessionId: "cs_test_123",
			});

		expect(claimResult).toEqual({
			claim: "claimed",
			grantResult: {
				granted: "inserted",
			},
		});

		const accessGrant = await testConvex.query(
			internal.access.getProductAccessDebug,
			{
				clerkUserId: "user_123",
			},
		);

		expect(accessGrant).toMatchObject({
			clerkUserId: "user_123",
			source: "stripe_checkout",
			status: "granted",
			stripeCheckoutSessionId: "cs_test_123",
			stripeCustomerId: "cus_123",
			stripePaymentIntentId: "pi_123",
		});
	});

	it("grants webhook-driven access without the QA helper scripts", async () => {
		const testConvex = convexTest(schema, convexModules);

		const grantResult = await testConvex.mutation(
			internal.access.grantProductAccessFromStripe,
			{
				clerkUserId: "user_456",
				stripeCustomerId: "cus_456",
				stripeCheckoutSessionId: "cs_test_456",
				stripePaymentIntentId: "pi_456",
			},
		);

		expect(grantResult).toEqual({
			granted: "inserted",
		});

		const accessGrant = await testConvex.query(
			internal.access.getProductAccessDebug,
			{
				clerkUserId: "user_456",
			},
		);

		expect(accessGrant).toMatchObject({
			clerkUserId: "user_456",
			source: "stripe_webhook",
			status: "granted",
			stripeCheckoutSessionId: "cs_test_456",
			stripeCustomerId: "cus_456",
			stripePaymentIntentId: "pi_456",
		});
	});
});
