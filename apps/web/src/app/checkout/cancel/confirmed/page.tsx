import type { Metadata } from "next";
import Link from "next/link";

import {
	EdgeRouteActionRow,
	EdgeRouteContainer,
	EdgeRouteDescription,
	EdgeRouteEyebrow,
	EdgeRouteHeader,
	EdgeRoutePage,
	EdgeRoutePanel,
	EdgeRoutePanelBody,
	EdgeRoutePanelDescription,
	EdgeRoutePanelTitle,
	EdgeRouteTitle,
} from "@/components/layout/edge-route-surface";
import { Button } from "@/components/ui/button";
import { productConfig, routeConfig } from "@/config/product";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default function Page() {
	return (
		<EdgeRoutePage className="flex items-center py-10">
			<EdgeRouteContainer className="max-w-2xl">
				<EdgeRoutePanel>
					<EdgeRoutePanelBody className="space-y-6 p-5 sm:p-6">
						<EdgeRouteHeader className="border-b-0 pb-0">
							<EdgeRouteEyebrow>Checkout canceled</EdgeRouteEyebrow>
							<EdgeRouteTitle>No charge was completed</EdgeRouteTitle>
							<EdgeRouteDescription>
								You can return to the offer page and restart checkout whenever
								you are ready. Nothing was charged from this canceled flow.
							</EdgeRouteDescription>
						</EdgeRouteHeader>
						<div className="border-t border-border/60 pt-5">
							<EdgeRoutePanelTitle>Next step</EdgeRoutePanelTitle>
							<EdgeRoutePanelDescription className="mt-2">
								Go back to Starter if you still want {productConfig.name}, or
								return home if you were just checking the offer.
							</EdgeRoutePanelDescription>
						</div>
					</EdgeRoutePanelBody>
					<div className="border-t border-border/60 px-5 py-4 sm:px-6">
						<EdgeRouteActionRow>
							<Button
								asChild
								variant="secondary"
								className="min-w-[12rem] justify-center"
							>
								<Link href={routeConfig.starter}>Back to Starter</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="min-w-[11rem] justify-center"
							>
								<Link href={routeConfig.home}>Go home</Link>
							</Button>
						</EdgeRouteActionRow>
					</div>
				</EdgeRoutePanel>
			</EdgeRouteContainer>
		</EdgeRoutePage>
	);
}
