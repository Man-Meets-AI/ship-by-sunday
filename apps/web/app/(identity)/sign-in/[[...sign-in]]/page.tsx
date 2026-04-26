import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInPage } from "@/app/(identity)/_components/sign-in-page";
import {
	buildSignUpHref,
	getSafeRedirectPath,
} from "@/features/auth/sign-in/sign-in-route-utils";
import { getPendingCheckoutSessionIdFromCookie } from "@/features/checkout/server/checkout-session-recovery";
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
	searchParams: Promise<{ redirect_url?: string }>;
}) {
	const { redirect_url: redirectUrl } = await searchParams;
	const disableClerkAuthLookup = shouldBypassClerkProtection();
	const safeRedirectPath = getSafeRedirectPath(redirectUrl);
	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	const postCheckoutSignUpHref = pendingCheckoutSessionId
		? buildSignUpHref({
				redirectPath: safeRedirectPath,
				sessionId: pendingCheckoutSessionId,
			})
		: null;

	if (!disableClerkAuthLookup && (await auth()).isAuthenticated) {
		redirect(safeRedirectPath);
	}

	return <SignInPage postCheckoutSignUpHref={postCheckoutSignUpHref} />;
}
