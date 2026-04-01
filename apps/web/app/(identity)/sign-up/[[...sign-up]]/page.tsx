import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import { PostCheckoutSignUpPage } from "@/features/auth/sign-up/post-checkout-sign-up-page";
import { getSafeRedirectPath } from "@/features/auth/sign-in/sign-in-route-utils";
import {
	getCheckoutSessionForRecovery,
	getStripeCheckoutSessionEmail,
	isStripeCheckoutSessionForCourse,
	isStripeCheckoutSessionPaid,
} from "@/features/checkout/server/checkout-session-recovery";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";

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
		redirect(`${routeConfig.home}${routeConfig.pricingHash}`);
	}

	const safeRedirectPath = getSafeRedirectPath(
		redirectUrl ?? getCheckoutSuccessHref(sessionId),
	);
	const session = await getCheckoutSessionForRecovery(sessionId);
	const checkoutEmail = session ? getStripeCheckoutSessionEmail(session) : null;
	const disableClerkAuthLookup = shouldBypassClerkProtection();

	if (
		!session ||
		!checkoutEmail ||
		!isStripeCheckoutSessionForCourse(session) ||
		!isStripeCheckoutSessionPaid(session) ||
		session.metadata?.clerkUserId ||
		session.client_reference_id
	) {
		redirect(safeRedirectPath);
	}

	if (!disableClerkAuthLookup && (await auth()).isAuthenticated) {
		redirect(safeRedirectPath);
	}

	return (
		<PostCheckoutSignUpPage
			checkoutEmail={checkoutEmail}
			redirectPath={safeRedirectPath}
		/>
	);
}
