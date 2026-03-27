"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { api } from "@/convex/_generated/api";
import { getPacketStageDefinition, type PacketStageId } from "@packet-compiler";
import type { RoutedPacketStageId } from "@/features/packet-flow/lib/packet-stage-routes";
import { getPacketStagePageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import { derivePacketStageProgressItems } from "@/features/packet-flow/lib/packet-stage-progress";
import { PacketStageNav } from "./packet-stage-nav";
import { PacketStageSidebar } from "./packet-stage-sidebar";
import { PacketStageStepController } from "./packet-stage-step-controller";
import { PacketStageStepStrip } from "./progression/packet-stage-step-strip";
import { PacketVideoCard } from "./video/packet-video-card";

const nextStageMap = {
	product: "design",
	design: "marketing",
	marketing: "build-plan",
	"build-plan": "review",
} as const satisfies Partial<Record<PacketStageId, PacketStageId>>;

export function PacketStagePage({
	stageId,
	stepId,
	initialWorkspaceState,
}: {
	stageId: RoutedPacketStageId;
	stepId: string;
	initialWorkspaceState: PacketWorkspaceState;
}) {
	const stage = getPacketStageDefinition(stageId);
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.packet.getPacketWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as PacketWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const stageStatus = workspaceState.stageStatuses.find(
		(item) => item.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing packet stage status for ${stageId}`);
	}
	if (!stageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}
	const stagePageMedia = getPacketStagePageMedia(stageId, stepId);
	const progressItems = derivePacketStageProgressItems(
		stage,
		stageStatus,
		stepId,
	);
	const nextStageId = stageStatus.isComplete
		? nextStageMap[stageId]
		: undefined;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
		>
			<div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-6 px-4 pb-10 pt-4">
				<div className="space-y-4">
					<PacketStageNav
						currentStageId={stageId}
						stageStatuses={workspaceState.stageStatuses}
					/>
					<PacketStageStepStrip
						stageId={stageId}
						activeStepId={stepId}
						progressItems={progressItems}
					/>
				</div>

				<div className="grid gap-x-12 gap-y-8 xl:grid-cols-[minmax(0,1fr)_30rem] xl:gap-x-16">
					<div className="space-y-6 pt-2">
						<PacketStageStepController
							stage={stage}
							stageId={stageId}
							stageStatus={stageStatus}
							stepId={stepId}
							projectFacts={workspaceState.projectDefinition?.facts ?? {}}
						/>
					</div>
					<aside className="space-y-10">
						{stagePageMedia ? (
							<PacketVideoCard content={stagePageMedia} />
						) : null}
						<PacketStageSidebar
							stage={stage}
							stageStatus={stageStatus}
							nextStageId={nextStageId}
						/>
					</aside>
				</div>
			</div>
		</AppShell>
	);
}
