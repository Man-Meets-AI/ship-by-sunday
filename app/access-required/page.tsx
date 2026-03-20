import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { AccessRequiredPage } from "@/features/product-access/components/access-required-page";
import { getServerProductAccess } from "@/features/product-access/server/product-access";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	const access = await getServerProductAccess();

	if (access.hasAccess) {
		redirect(routeConfig.mission);
	}

	return <AccessRequiredPage />;
}
