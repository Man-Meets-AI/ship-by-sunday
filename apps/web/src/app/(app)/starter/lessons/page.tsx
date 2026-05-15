import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { TutorialVideosPage } from "@/app/(app)/tutorials/_components/tutorial-videos-page";
import { buildTutorialVideoLibrary } from "@/app/(app)/tutorials/_lib/tutorial-video-library";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";

export const metadata: Metadata = {
	title: "Starter Lessons",
};

export default async function StarterLessonsPage() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")) {
		redirect(routeConfig.appHome);
	}

	return <TutorialVideosPage library={buildTutorialVideoLibrary()} />;
}
