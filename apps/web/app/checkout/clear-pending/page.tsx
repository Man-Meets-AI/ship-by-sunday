import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/platform/auth/auth-route-utils";

import { ClearPendingCheckoutForm } from "./_components/clear-pending-checkout-form";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ redirect_url?: string | string[] }>;
}) {
	const { redirect_url: redirectUrl } = await searchParams;
	const redirectPath = getSafeRedirectPath(redirectUrl);

	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 text-foreground">
			<section className="w-full max-w-sm space-y-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
				<div className="space-y-1">
					<h1 className="text-lg font-semibold tracking-normal">
						Clearing checkout state
					</h1>
					<p className="text-sm leading-6 text-muted-foreground">
						You will be sent back to the checkout recovery page.
					</p>
				</div>
				<ClearPendingCheckoutForm redirectPath={redirectPath} />
			</section>
		</main>
	);
}
