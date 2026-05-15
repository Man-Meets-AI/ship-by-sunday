import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getRateLimitedResponse } from "@/app/api/_lib/request-rate-limit";
import { api } from "@/convex/_generated/api";
import { CheckoutSuccessView } from "@/app/checkout/success/_components/checkout-success-view";
import {
	getCheckoutSuccessFixture,
	hasCheckoutSuccessFixtureParam,
} from "@/app/checkout/success/_lib/checkout-success-fixtures";
import { getCheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import { getPendingCheckoutSessionIdFromCookie } from "@/platform/billing/checkout/checkout-session-recovery";
import { getCheckoutOfferSuccessPath } from "@/platform/billing/checkout/checkout-offers";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";
import { getSignInRedirectHref } from "@/config/product";
import { syncStripeCheckoutSessionToConvex } from "@/lib/billing/stripe-sync";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

async function syncBillingDomainForCheckoutSuccess({
	checkoutSessionState,
	sessionId,
}: {
	checkoutSessionState: Awaited<ReturnType<typeof getCheckoutSessionState>>;
	sessionId: string | undefined;
}) {
	if (
		!sessionId ||
		(checkoutSessionState.kind !== "validated" &&
			checkoutSessionState.kind !== "sign_in_required" &&
			checkoutSessionState.kind !== "wrong_account")
	) {
		return;
	}

	try {
		await syncStripeCheckoutSessionToConvex({
			sessionId,
			source: "checkout_success",
		});
	} catch (error) {
		console.error("Checkout success billing-domain sync failed", {
			sessionId,
			error,
		});
	}
}

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string; fixture?: string }>;
}) {
	const requestHeaders = await headers();
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
	if (sessionId) {
		const rateLimitedResponse = getRateLimitedResponse({
			bucket: "checkout.success.recovery",
			identity: sessionId,
			request: new Request("https://ship-by-sunday.local/checkout/success", {
				headers: requestHeaders,
			}),
			limit: 10,
			windowMs: 60_000,
		});
		if (rateLimitedResponse) {
			notFound();
		}
	}

	const checkoutSessionState = await getCheckoutSessionState(sessionId);
	await syncBillingDomainForCheckoutSuccess({
		checkoutSessionState,
		sessionId,
	});
	if (checkoutSessionState.kind === "sign_in_required") {
		redirect(
			getSignInRedirectHref(
				`${getCheckoutOfferSuccessPath(checkoutSessionState.offerId)}?welcome=checkout`,
			),
		);
	}

	const initialProductAccess =
		checkoutSessionState.kind === "validated"
			? await fetchAuthenticatedQuery(api.entitlements.viewerProductAccess, {})
			: null;

	return (
		<CheckoutSuccessView
			checkoutSessionState={checkoutSessionState}
			initialProductAccess={initialProductAccess}
		/>
	);
}
