"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { api } from "@/convex/_generated/api";
import { usePacketStageStepState } from "@/features/packet-flow/hooks/use-packet-stage-step-state";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition, type PacketStageId } from "@packet-compiler";
import {
	getAdjacentPacketPageHrefs,
	getPacketStageStepIndex,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { getPacketStagePageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import { PacketStageProgressPanel } from "./progression/packet-stage-progress-panel";
import { PacketStageNav } from "./packet-stage-nav";
import { PacketStageSidebar } from "./packet-stage-sidebar";
import { PacketStageStepCard } from "./packet-stage-step-card";
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
	const currentStepIndex = getPacketStageStepIndex(stageId, stepId);
	const { previousHref, nextHref } = getAdjacentPacketPageHrefs(
		stageId,
		stepId,
	);
	const stagePageMedia = getPacketStagePageMedia(stageId, stepId);

	const saveProjectDefinitionFacts = useMutation(
		api.packet.saveProjectDefinitionFacts,
	);
	const {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		goToPreviousStep,
		handleSaveAndContinue,
		handleSaveAndStay,
		handleFieldChange,
		isSaving,
	} = usePacketStageStepState({
		stage,
		stageId,
		stageStatus,
		stepId,
		previousHref,
		nextHref,
		projectFacts: workspaceState.projectDefinition?.facts ?? {},
		saveProjectDefinitionFacts,
	});
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
						{currentStep ? (
							<PacketStageStepCard
								currentStep={currentStep}
								currentStepIndex={currentStepIndex}
								totalSteps={stage.steps.length}
								canGoBack={Boolean(previousHref)}
								draftValues={currentDraftValues}
								fieldErrors={currentFieldErrors}
								feedback={currentFeedback}
								isSaving={isSaving}
								onBack={goToPreviousStep}
								onChange={handleFieldChange}
								onSaveAndContinue={handleSaveAndContinue}
								onSaveAndStay={handleSaveAndStay}
							/>
						) : null}
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
