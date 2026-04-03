import { api } from "@/convex/_generated/api";
import { BlueprintReviewPage } from "@/features/blueprint-flow/components/blueprint-review-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ showLessonMap?: string }>;
}) {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
	);
	const { showLessonMap } = await searchParams;

	if (!initialWorkspaceState) {
		throw new Error("Blueprint workspace state missing");
	}

	const isUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const initialResumeDestination = isUnlocked
		? await fetchAuthenticatedQuery(
				api.blueprint.getBlueprintResumeDestination,
				{},
			)
		: null;
	const initialBonusMissionState =
		isUnlocked && initialResumeDestination?.postReviewTargets
			? await fetchAuthenticatedQuery(api.course.getBonusMissionState, {})
			: null;

	return (
		<BlueprintReviewPage
			initialWorkspaceState={initialWorkspaceState}
			initialPostReviewTargets={
				initialResumeDestination?.postReviewTargets ?? null
			}
			initialBonusMissionState={initialBonusMissionState ?? null}
			initialShowLessonMap={showLessonMap === "1"}
		/>
	);
}
