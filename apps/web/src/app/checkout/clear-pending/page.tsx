import type { Metadata } from "next";

import {
	EdgeRouteContainer,
	EdgeRouteDescription,
	EdgeRouteEyebrow,
	EdgeRouteHeader,
	EdgeRoutePage,
	EdgeRoutePanel,
	EdgeRoutePanelBody,
	EdgeRouteTitle,
} from "@/components/layout/edge-route-surface";
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
		<EdgeRoutePage className="flex items-center py-10">
			<EdgeRouteContainer className="max-w-sm">
				<EdgeRoutePanel>
					<EdgeRoutePanelBody className="space-y-5">
						<EdgeRouteHeader className="border-b-0 pb-0">
							<EdgeRouteEyebrow>Checkout recovery</EdgeRouteEyebrow>
							<EdgeRouteTitle>Clearing checkout state</EdgeRouteTitle>
							<EdgeRouteDescription>
								You will be sent back to the checkout recovery page.
							</EdgeRouteDescription>
						</EdgeRouteHeader>
						<ClearPendingCheckoutForm redirectPath={redirectPath} />
					</EdgeRoutePanelBody>
				</EdgeRoutePanel>
			</EdgeRouteContainer>
		</EdgeRoutePage>
	);
}
