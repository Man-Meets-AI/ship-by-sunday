import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutEmailHandoffPage } from "@/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-page";
import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import { getSafeRedirectPath } from "@/platform/auth/auth-route-utils";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";
import {
	clearPendingCheckoutSessionCookie,
	getCheckoutSessionForRecovery,
	getStripeCheckoutSessionEmail,
	isStripeCheckoutSessionForCourse,
	isStripeCheckoutSessionPaid,
} from "@/platform/billing/checkout/checkout-session-recovery";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ redirect_url?: string; session_id?: string }>;
}) {
	const { redirect_url: redirectUrl, session_id: sessionId } =
		await searchParams;

	if (!sessionId) {
		return redirect(`${routeConfig.home}${routeConfig.pricingHash}`);
	}

	const safeRedirectPath = getSafeRedirectPath(
		redirectUrl ?? getCheckoutSuccessHref(sessionId),
	);
	const session = await getCheckoutSessionForRecovery(sessionId);
	if (!session) {
		await clearPendingCheckoutSessionCookie();
		return redirect(safeRedirectPath);
	}

	if (!isStripeCheckoutSessionForCourse(session)) {
		await clearPendingCheckoutSessionCookie();
		return redirect(safeRedirectPath);
	}

	if (!isStripeCheckoutSessionPaid(session)) {
		return redirect(getCheckoutSuccessHref(sessionId));
	}

	const checkoutEmail = getStripeCheckoutSessionEmail(session);
	if (!checkoutEmail) {
		return redirect(safeRedirectPath);
	}

	if (!shouldBypassClerkProtection() && (await auth()).isAuthenticated) {
		return redirect(safeRedirectPath);
	}

	return (
		<CheckoutEmailHandoffPage
			checkoutEmail={checkoutEmail}
			redirectPath={safeRedirectPath}
		/>
	);
}
