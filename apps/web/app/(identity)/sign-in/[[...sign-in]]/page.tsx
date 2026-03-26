import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInPage } from "@/features/auth/sign-in/sign-in-page";
import { getSafeRedirectPath } from "@/features/auth/sign-in/sign-in-route-utils";
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

	if (!disableClerkAuthLookup && (await auth()).isAuthenticated) {
		redirect(getSafeRedirectPath(redirectUrl));
	}

	return <SignInPage />;
}
