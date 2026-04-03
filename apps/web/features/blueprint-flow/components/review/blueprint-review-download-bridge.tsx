"use client";

import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";
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
	const hasUnlockedReviewFlow = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const blueprintStageStatus = workspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "blueprint",
	);
	const blueprintSectionStatuses = blueprintPageSections.map((section) => {
		const missingFactKeys = (
			section.requiredFieldKeys ?? section.fieldKeys
		).filter((fieldKey) =>
			blueprintStageStatus?.missingFactKeys.includes(fieldKey),
		);

		return {
			sectionId: section.id,
			isComplete: missingFactKeys.length === 0,
			missingFactKeys,
		};
	});

	return (
		<div className="flex flex-col gap-6">
			<BlueprintReviewCheckpointCard
				blueprintSectionStatuses={blueprintSectionStatuses}
				isReviewReady={isReviewReady}
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
