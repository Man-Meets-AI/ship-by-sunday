import type { Metadata } from "next";
import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { productConfig, routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import { clearPendingCheckoutSessionCookie } from "@/platform/billing/checkout/checkout-session-recovery";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	await clearPendingCheckoutSessionCookie();

	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 tracking-normal">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardDescription>Checkout canceled</CardDescription>
					<CardTitle className="text-3xl">No charge was completed</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<p className="text-sm text-muted-foreground">
						You can return to the offer, review the pricing, and restart
						checkout whenever you are ready. Nothing was charged from this
						canceled flow.
					</p>
					<div className="rounded-lg border bg-muted/30 p-4">
						<p className="text-sm font-medium">Next step</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Go back to pricing if you still want {productConfig.name}, or
							return home if you were just checking the offer.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-wrap gap-3">
					<Button
						asChild
						variant="secondary"
						className="min-w-[12rem] justify-center"
					>
						<Link href={`${routeConfig.home}${routeConfig.pricingHash}`}>
							Back to pricing
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="min-w-[11rem] justify-center"
					>
						<Link href={routeConfig.home}>Go home</Link>
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
