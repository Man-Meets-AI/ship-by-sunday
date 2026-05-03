import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}

	const resumeDestination = await fetchAuthenticatedQuery(
		api.blueprint.getBlueprintResumeDestination,
		{},
	);

	if (!resumeDestination?.postReviewTargets) {
		redirect(routeConfig.review);
	}

	redirect(resumeDestination.postReviewTargets.buildLessonsDestination);
}
