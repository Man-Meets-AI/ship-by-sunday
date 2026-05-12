import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { TutorialVideosPage } from "./_components/tutorial-videos-page";
import { buildTutorialVideoLibrary } from "./_lib/tutorial-video-library";

export const metadata: Metadata = {
	title: "Tutorial Videos",
};

export default async function TutorialsPage() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")) {
		redirect(routeConfig.appHome);
	}

	return <TutorialVideosPage library={buildTutorialVideoLibrary()} />;
}
