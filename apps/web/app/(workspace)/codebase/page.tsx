import { api } from "@/convex/_generated/api";
import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { CodebasePage } from "@/app/(workspace)/_components/codebase-flow/codebase-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}

	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.codebase.getCodebaseWorkspaceState,
		{},
	);

	if (!initialWorkspaceState) {
		throw new Error("Codebase workspace state missing");
	}

	const isPostReviewUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const resumeDestination = isPostReviewUnlocked
		? await fetchAuthenticatedQuery(
				api.codebase.getCodebaseResumeDestination,
				{},
			)
		: null;
	const bonusMissionState = isPostReviewUnlocked
		? await fetchAuthenticatedQuery(api.course.getBonusMissionState, {})
		: null;

	return (
		<CodebasePage
			initialBonusMissionState={bonusMissionState ?? null}
			initialPostReviewTargets={resumeDestination?.postReviewTargets ?? null}
			initialWorkspaceState={initialWorkspaceState}
		/>
	);
}
