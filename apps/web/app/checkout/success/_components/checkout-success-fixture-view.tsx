"use client";

import { useEffect, useState } from "react";

import type { CheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import type { ProductAccess } from "@/lib/product-access";

import { CheckoutSuccessViewContent } from "./checkout-success-view-content";

export type CheckoutSuccessFixtureProps = {
	readonly fixtureSlug: string;
	readonly fixtureFlipAfterMs?: number;
	readonly fixtureSuppressRedirect?: boolean;
};

export function CheckoutSuccessFixtureView({
	checkoutSessionState,
	initialProductAccess,
	fixture,
}: {
	checkoutSessionState: CheckoutSessionState;
	initialProductAccess?: ProductAccess | null;
	fixture: CheckoutSuccessFixtureProps;
}) {
	const initialAccessReady = Boolean(initialProductAccess?.hasAccess);
	const [isAccessReady, setIsAccessReady] = useState(initialAccessReady);

	useEffect(() => {
		if (
			isAccessReady ||
			!fixture.fixtureFlipAfterMs ||
			fixture.fixtureFlipAfterMs <= 0
		) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsAccessReady(true);
		}, fixture.fixtureFlipAfterMs);

		return () => window.clearTimeout(timeout);
	}, [fixture.fixtureFlipAfterMs, isAccessReady]);

	return (
		<CheckoutSuccessViewContent
			checkoutSessionState={checkoutSessionState}
			isAccessReady={isAccessReady}
			suppressRedirect={Boolean(fixture.fixtureSuppressRedirect)}
			fixtureSlug={fixture.fixtureSlug}
		/>
	);
}
