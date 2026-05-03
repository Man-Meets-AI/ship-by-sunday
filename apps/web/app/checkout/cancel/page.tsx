import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { buildClearPendingCheckoutSessionHref } from "@/platform/auth/auth-route-utils";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	return redirect(
		buildClearPendingCheckoutSessionHref(routeConfig.checkoutCancelConfirmed),
	);
}
