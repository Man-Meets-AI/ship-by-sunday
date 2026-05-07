import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInPage } from "@/app/(identity)/_components/sign-in-page";
import {
	getSafeRedirectPath,
	isCheckoutWelcomeRedirectPath,
} from "@/platform/auth/auth-route-utils";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";
import { getValidatedPendingCheckoutEmailFromCookie } from "@/platform/billing/checkout/checkout-session-recovery";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ redirect_url?: string }>;
}) {
	const { redirect_url: redirectUrl } = await searchParams;
	const disableClerkAuthLookup = shouldBypassClerkProtection();
	const safeRedirectPath = getSafeRedirectPath(redirectUrl);

	if (!disableClerkAuthLookup && (await auth()).isAuthenticated) {
		return redirect(safeRedirectPath);
	}

	const initialEmail = isCheckoutWelcomeRedirectPath(safeRedirectPath)
		? await getValidatedPendingCheckoutEmailFromCookie()
		: null;

	return (
		<SignInPage
			initialEmail={initialEmail ?? undefined}
			isInitialEmailLocked={Boolean(initialEmail)}
		/>
	);
}
