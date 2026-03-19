import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { getServerViewerAccess } from "@/features/course/access/server/course-access";

export default async function Page() {
	const access = await getServerViewerAccess();

	if (!access.hasAccess) {
		redirect(routeConfig.accessRequired);
	}

	return <ArtifactsPage />;
}
