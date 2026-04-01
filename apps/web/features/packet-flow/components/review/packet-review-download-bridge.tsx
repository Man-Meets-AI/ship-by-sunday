"use client";

import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { PacketReviewCheckpointCard } from "./packet-review-checkpoint-card";
import { PacketReviewExecutePreview } from "./packet-review-execute-preview";

export function PacketReviewDownloadBridge({
	onOpenLessonMap,
	workspaceState,
	postReviewTargets,
}: {
	onOpenLessonMap?: () => void;
	workspaceState: PacketWorkspaceState;
	postReviewTargets: PostReviewNavigationTargets | null;
}) {
	const isReviewReady = workspaceState.packetReadiness.review.isReady;
	const packetReadiness = workspaceState.packetReadiness;
	const hasUnlockedReviewFlow = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);

	return (
		<div className="flex flex-col gap-6">
			<PacketReviewCheckpointCard
				isReviewReady={isReviewReady}
				packetReadiness={packetReadiness}
			/>
			<PacketReviewExecutePreview
				buildLessonsHref={postReviewTargets?.buildLessonsDestination ?? null}
				isReviewReady={isReviewReady}
				hasUnlockedReviewFlow={hasUnlockedReviewFlow}
				onOpenLessonMap={onOpenLessonMap}
			/>
		</div>
	);
}
