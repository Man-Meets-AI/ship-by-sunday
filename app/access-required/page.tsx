import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { AccessRequiredPage } from "@/features/product-access/components/access-required-page";
import { getServerProductAccess } from "@/features/product-access/server/product-access";

export default async function Page() {
	const access = await getServerProductAccess();

	if (access.hasAccess) {
		redirect(routeConfig.mission);
	}

	return <AccessRequiredPage />;
}
