import { notFound, redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(protected)/_components/access-required/access-required-page";
import { TutorialVideoPage } from "@/app/(protected)/tutorials/_components/tutorial-video-page";
import { loadWorkspacePageAccess } from "@/app/(protected)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { getLessonByRouteSegment } from "@/lib/course/lesson/model/manifest";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";

export default async function StarterLessonRoute({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")) {
		redirect(routeConfig.appHome);
	}

	const { lessonKey } = await params;
	const lesson = getLessonByRouteSegment(lessonKey);

	if (!lesson) {
		notFound();
	}

	return <TutorialVideoPage lesson={lesson} />;
}
