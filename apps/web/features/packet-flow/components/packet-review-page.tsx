import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition } from "@packet-compiler";
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
			subtitle="Finish the required packet run, download the Starter Snapshot, then optionally keep moving."
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="review"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
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
