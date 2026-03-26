import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition } from "@packet-compiler";
import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { getPacketReviewPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import { PacketReviewArtifactGrid } from "./review/packet-review-artifact-grid";
import { PacketReviewDownloadBridge } from "./review/packet-review-download-bridge";

export function PacketReviewPage({
	initialWorkspaceState,
}: {
	initialWorkspaceState: PacketWorkspaceState;
}) {
	const reviewStageStatus = initialWorkspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "review",
	);
	if (reviewStageStatus && !reviewStageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(initialWorkspaceState.firstIncompleteStageId)
				.route,
		);
	}

	const isReviewReady = initialWorkspaceState.packetReadiness.review.isReady;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
			title="Review & Download"
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="review"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
				<PacketVideoCard content={getPacketReviewPageMedia()} />
				<PacketReviewDownloadBridge
					isReviewReady={isReviewReady}
					executeShipUnlockedAt={
						initialWorkspaceState.workflowState?.executeShipUnlockedAt
					}
				/>
				<PacketReviewArtifactGrid
					packetReadiness={initialWorkspaceState.packetReadiness}
				/>
			</div>
		</AppShell>
	);
}
