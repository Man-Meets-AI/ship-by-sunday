import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { AccessRequiredPage } from "@/features/course/access/components/access-required-page";
import { getServerViewerAccess } from "@/features/course/access/server/course-access";

export default async function Page() {
	const access = await getServerViewerAccess();

	if (access.hasAccess) {
		redirect(routeConfig.mission);
	}

	return <AccessRequiredPage />;
}
