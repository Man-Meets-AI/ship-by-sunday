import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { MissionPage } from "@/features/course/mission/components/mission-page";
import { getServerViewerAccess } from "@/features/course/access/server/course-access";

export default async function Page() {
	const access = await getServerViewerAccess();

	if (!access.hasAccess) {
		redirect(routeConfig.accessRequired);
	}

	return <MissionPage />;
}
