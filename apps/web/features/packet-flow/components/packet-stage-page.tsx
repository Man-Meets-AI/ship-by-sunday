"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { api } from "@/convex/_generated/api";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition, type PacketStageId } from "@packet-compiler";
import type { RoutedPacketStageId } from "@/features/packet-flow/lib/packet-stage-routes";
import { getPacketStagePageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import { PacketStageProgressPanel } from "./progression/packet-stage-progress-panel";
import { PacketStageNav } from "./packet-stage-nav";
import { PacketStageSidebar } from "./packet-stage-sidebar";
import { PacketStageStepController } from "./packet-stage-step-controller";
import { PacketVideoCard } from "./video/packet-video-card";

const packetDownloadStageMap = {
	design: "design",
	marketing: "marketing",
	"build-plan": "build",
} as const;

const nextStageMap = {
	product: "design",
	design: "marketing",
	marketing: "build-plan",
	"build-plan": "review",
} as const satisfies Partial<Record<PacketStageId, PacketStageId>>;

function getPacketDownloadHref(
	stageId: Exclude<PacketStageId, "start" | "review">,
	isComplete: boolean,
) {
	if (!isComplete) {
		return undefined;
	}

	const stage =
		packetDownloadStageMap[stageId as keyof typeof packetDownloadStageMap];
	return stage ? `/api/download/packet/${stage}` : undefined;
}

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
	const downloadHref = getPacketDownloadHref(stageId, stageStatus.isComplete);
	const nextStageId = stageStatus.isComplete
		? nextStageMap[stageId]
		: undefined;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
			title={stage.label}
		>
			<div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId={stageId}
					stageStatuses={workspaceState.stageStatuses}
				/>
				<div className="grid gap-x-8 gap-y-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
					{stagePageMedia ? (
						<div className="xl:col-start-2 xl:row-start-1">
							<PacketVideoCard content={stagePageMedia} />
						</div>
					) : null}
					<div className="space-y-8 xl:col-start-1 xl:row-span-2">
						<PacketStageProgressPanel
							stageId={stageId}
							stage={stage}
							stageStatus={stageStatus}
							activeStepId={stepId}
						/>
						<PacketStageStepController
							stage={stage}
							stageId={stageId}
							stageStatus={stageStatus}
							stepId={stepId}
							projectFacts={workspaceState.projectDefinition?.facts ?? {}}
						/>
					</div>
					<div className="space-y-6 xl:col-start-2 xl:row-start-2">
						<PacketStageSidebar
							stageStatus={stageStatus}
							downloadHref={downloadHref}
							nextStageId={nextStageId}
						/>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
