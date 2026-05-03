import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { IdentityPageFrame } from "@/app/(identity)/_components/identity-page-frame";
import { CheckoutEmailHandoffPage } from "@/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-page";
import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import {
	buildClearPendingCheckoutSessionHref,
	getSafeRedirectPath,
} from "@/platform/auth/auth-route-utils";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";
import {
	fulfillCheckoutSessionByEmail,
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
		return redirect(buildClearPendingCheckoutSessionHref(safeRedirectPath));
	}

	if (!isStripeCheckoutSessionForCourse(session)) {
		return redirect(buildClearPendingCheckoutSessionHref(safeRedirectPath));
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

	const fulfillmentResult = await fulfillCheckoutSessionByEmail(
		sessionId,
		"checkout.email_handoff.fulfillment",
	);
	if (fulfillmentResult.kind !== "fulfilled") {
		return redirect(safeRedirectPath);
	}

	return (
		<IdentityPageFrame>
			<CheckoutEmailHandoffPage
				checkoutEmail={fulfillmentResult.checkoutEmail || checkoutEmail}
				redirectPath={safeRedirectPath}
			/>
		</IdentityPageFrame>
	);
}
