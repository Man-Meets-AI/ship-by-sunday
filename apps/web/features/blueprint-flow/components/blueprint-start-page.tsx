import { AppShell } from "@/features/course/shared/components/app-shell";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { BlueprintStartOverviewCard } from "./start/blueprint-start-overview-card";
import { BlueprintStartWelcomeVideoCard } from "./start/blueprint-start-welcome-video-card";

export function BlueprintStartPage({
	initialBonusMissionState = null,
	initialPostReviewTargets = null,
	initialWorkspaceState,
}: {
	initialBonusMissionState?: BonusMissionState | null;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialWorkspaceState: BlueprintWorkspaceState;
}) {
	const isPostReviewUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const postReviewItems =
		isPostReviewUnlocked && initialPostReviewTargets && initialBonusMissionState
			? buildPostReviewPrimaryNav({
					activeSection: null,
					missionState: initialBonusMissionState,
					postReviewTargets: initialPostReviewTargets,
				})
			: buildLockedPostReviewPrimaryNav();

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Start"
			primaryNav={{
				kind: "combined",
				currentBlueprintStageId: "start",
				stageStatuses: initialWorkspaceState.stageStatuses,
				postReviewItems,
			}}
		>
			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-20 pt-12">
				<div className="space-y-16">
					<BlueprintStartOverviewCard
						nextStageId={
							initialWorkspaceState.projectDefinition
								? initialWorkspaceState.firstIncompleteStageId
								: "product"
						}
					/>
					<BlueprintStartWelcomeVideoCard />
				</div>
			</div>
		</AppShell>
	);
}
