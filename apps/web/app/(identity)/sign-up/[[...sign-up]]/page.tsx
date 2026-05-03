import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import {
	buildCheckoutEmailHandoffHref,
	getSafeRedirectPath,
} from "@/platform/auth/auth-route-utils";

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

	return redirect(
		buildCheckoutEmailHandoffHref({
			redirectPath: safeRedirectPath,
			sessionId,
		}),
	);
}
