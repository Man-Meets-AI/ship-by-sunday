import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { CheckoutSuccessView } from "@/app/checkout/success/_components/checkout-success-view";
import {
	getCheckoutSuccessFixture,
	hasCheckoutSuccessFixtureParam,
} from "@/app/checkout/success/_lib/checkout-success-fixtures";
import { getCheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import { getPendingCheckoutSessionIdFromCookie } from "@/platform/billing/checkout/checkout-session-recovery";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";
import { getSignInRedirectHref, routeConfig } from "@/config/product";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string; fixture?: string }>;
}) {
	const { session_id: searchSessionId, fixture } = await searchParams;
	const fixturePacket = getCheckoutSuccessFixture({ fixture });
	if (fixturePacket) {
		return (
			<CheckoutSuccessView
				checkoutSessionState={fixturePacket.checkoutSessionState}
				initialProductAccess={fixturePacket.initialProductAccess}
				fixture={{
					fixtureSlug: fixturePacket.fixtureSlug,
					fixtureFlipAfterMs: fixturePacket.fixtureFlipAfterMs,
					fixtureSuppressRedirect: fixturePacket.fixtureSuppressRedirect,
				}}
			/>
		);
	}
	if (hasCheckoutSuccessFixtureParam({ fixture })) {
		notFound();
	}

	const sessionId =
		searchSessionId ??
		(await getPendingCheckoutSessionIdFromCookie()) ??
		undefined;
	const checkoutSessionState = await getCheckoutSessionState(sessionId);
	if (checkoutSessionState.kind === "sign_in_required") {
		redirect(getSignInRedirectHref(`${routeConfig.appHome}?welcome=checkout`));
	}

	const initialProductAccess =
		checkoutSessionState.kind === "validated"
			? await fetchAuthenticatedQuery(api.access.viewerProductAccess, {})
			: null;

	return (
		<CheckoutSuccessView
			checkoutSessionState={checkoutSessionState}
			initialProductAccess={initialProductAccess}
		/>
	);
}
