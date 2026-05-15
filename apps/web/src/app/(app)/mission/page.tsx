import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { BonusRouteStatePanel } from "@/app/(app)/_components/execute-ship/bonus-route-state-panel";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "tutorials")) {
		redirect(routeConfig.appHome);
	}

	const resumeDestination = await fetchAuthenticatedQuery(
		api.codebase.getCodebaseResumeDestination,
		{},
	);

	if (!resumeDestination?.postReviewTargets) {
		return (
			<BonusRouteStatePanel
				eyebrow="Continuation library"
				title="Lesson Map opens after Review."
				description="Finish the core Ship Codebase run first. Once your product truth is locked and your Ship by Sunday Codebase is ready, the post-review Lesson Map opens as the continuation surface for building, launch prep, and revisiting the work."
				actionHref={routeConfig.review}
				actionLabel="Go to Review"
			/>
		);
	}

	redirect(resumeDestination.postReviewTargets.lessonMapDestination);
}
