import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { TutorialVideosPage } from "./_components/tutorial-videos-page";
import { buildTutorialVideoLibrary } from "./_lib/tutorial-video-library";

export const metadata: Metadata = {
	title: "Tutorial Videos",
};

export default async function TutorialsPage() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (
		workspaceAccess.kind === "granted" &&
		!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")
	) {
		redirect(routeConfig.appHome);
	}

	return <TutorialVideosPage library={buildTutorialVideoLibrary()} />;
}
