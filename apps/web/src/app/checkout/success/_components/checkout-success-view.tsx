"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { CheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import type { ProductAccess } from "@/lib/product-access";

import {
	CheckoutSuccessFixtureView,
	type CheckoutSuccessFixtureProps,
} from "./checkout-success-fixture-view";
import { CheckoutSuccessViewContent } from "./checkout-success-view-content";

export function CheckoutSuccessView({
	checkoutSessionState,
	initialProductAccess,
	fixture,
}: {
	checkoutSessionState: CheckoutSessionState;
	initialProductAccess?: ProductAccess | null;
	fixture?: CheckoutSuccessFixtureProps;
}) {
	if (fixture) {
		return (
			<CheckoutSuccessFixtureView
				checkoutSessionState={checkoutSessionState}
				initialProductAccess={initialProductAccess}
				fixture={fixture}
			/>
		);
	}
	return (
		<CheckoutSuccessLiveView
			checkoutSessionState={checkoutSessionState}
			initialProductAccess={initialProductAccess}
		/>
	);
}

function CheckoutSuccessLiveView({
	checkoutSessionState,
	initialProductAccess,
}: {
	checkoutSessionState: CheckoutSessionState;
	initialProductAccess?: ProductAccess | null;
}) {
	const { isAuthenticated } = useConvexAuth();
	const liveAccess = useQuery(
		api.entitlements.viewerProductAccess,
		isAuthenticated ? {} : "skip",
	) as ProductAccess | undefined;
	const access = liveAccess ?? initialProductAccess ?? undefined;

	return (
		<CheckoutSuccessViewContent
			checkoutSessionState={checkoutSessionState}
			isAccessReady={Boolean(access?.hasAccess)}
			suppressRedirect={false}
		/>
	);
}
