import { api } from "@/convex/_generated/api";
import { BlueprintStartPage } from "@/features/blueprint-flow/components/blueprint-start-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
	);

	if (!initialWorkspaceState) {
		throw new Error("Blueprint workspace state missing");
	}

	const isPostReviewUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const resumeDestination = isPostReviewUnlocked
		? await fetchAuthenticatedQuery(
				api.blueprint.getBlueprintResumeDestination,
				{},
			)
		: null;
	const bonusMissionState = isPostReviewUnlocked
		? await fetchAuthenticatedQuery(api.course.getBonusMissionState, {})
		: null;

	return (
		<BlueprintStartPage
			initialWorkspaceState={initialWorkspaceState}
			initialPostReviewTargets={resumeDestination?.postReviewTargets ?? null}
			initialBonusMissionState={bonusMissionState ?? null}
		/>
	);
}
