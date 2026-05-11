import { notFound, redirect } from "next/navigation";

import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { getLessonByRouteSegment } from "@/lib/course/lesson/model/manifest";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";

import { TutorialVideoPage } from "../_components/tutorial-video-page";

export default async function TutorialVideoRoute({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (
		workspaceAccess.kind === "granted" &&
		!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")
	) {
		redirect(routeConfig.appHome);
	}

	const { lessonKey } = await params;
	const lesson = getLessonByRouteSegment(lessonKey);

	if (!lesson) {
		notFound();
	}

	return <TutorialVideoPage lesson={lesson} />;
}
