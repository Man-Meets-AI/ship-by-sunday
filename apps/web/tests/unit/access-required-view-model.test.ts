import { describe, expect, it } from "vitest";

import { getAccessViewState } from "@/app/(app)/_lib/access-required-view-model";
import type { ProductAccess } from "@/lib/product-access";

function createProductAccess(
	overrides: Partial<ProductAccess> = {},
): ProductAccess {
	return {
		clerkUserId: "user_123",
		hasAccess: false,
		status: "no_access",
		capabilities: [],
		...overrides,
	};
}

describe("getAccessViewState", () => {
	it("keeps a granted access result in loading while the app shell redirects", () => {
		expect(
			getAccessViewState(
				createProductAccess({
					hasAccess: true,
					status: "granted",
					capabilities: ["worker"],
				}),
			),
		).toEqual({ kind: "loading" });
	});

	it("maps stale granted rows without effective access to a denied state", () => {
		expect(
			getAccessViewState(
				createProductAccess({
					hasAccess: false,
					status: "granted",
				}),
			),
		).toEqual({ kind: "no_access" });
	});

	it("shows paid checkout recovery before the generic denied state", () => {
		const pendingCheckoutRecovery = {
			kind: "payment_pending" as const,
			sessionId: "cs_test_123",
			paymentStatus: "unpaid",
		};

		expect(
			getAccessViewState(
				createProductAccess({
					hasAccess: false,
					status: "granted",
					pendingCheckoutRecovery,
				}),
			),
		).toEqual({
			kind: "paid_checkout_recovery",
			recovery: pendingCheckoutRecovery,
		});
	});
});
