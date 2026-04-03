"use client";

import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { BlueprintReviewCheckpointCard } from "./blueprint-review-checkpoint-card";
import { BlueprintReviewExecutePreview } from "./blueprint-review-execute-preview";

export function BlueprintReviewDownloadBridge({
	onOpenLessonMap,
	workspaceState,
	postReviewTargets,
}: {
	onOpenLessonMap?: () => void;
	workspaceState: BlueprintWorkspaceState;
	postReviewTargets: PostReviewNavigationTargets | null;
}) {
	const isReviewReady = workspaceState.blueprintReadiness.review.isReady;
	const blueprintReadiness = workspaceState.blueprintReadiness;
	const hasUnlockedReviewFlow = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);

	return (
		<div className="flex flex-col gap-6">
			<BlueprintReviewCheckpointCard
				isReviewReady={isReviewReady}
				blueprintReadiness={blueprintReadiness}
			/>
			<BlueprintReviewExecutePreview
				buildLessonsHref={postReviewTargets?.buildLessonsDestination ?? null}
				isReviewReady={isReviewReady}
				hasUnlockedReviewFlow={hasUnlockedReviewFlow}
				onOpenLessonMap={onOpenLessonMap}
			/>
		</div>
	);
}
