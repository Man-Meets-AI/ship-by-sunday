"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { getPacketStageDefinition, type PacketStageId } from "@packet-compiler";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketStageLeaveDialog } from "@/features/packet-flow/components/packet-stage-leave-dialog";
import { PacketStageSidebar } from "@/features/packet-flow/components/packet-stage-sidebar";
import { PacketStageStepCard } from "@/features/packet-flow/components/packet-stage-step-card";
import { PacketStageStepStrip } from "@/features/packet-flow/components/progression/packet-stage-step-strip";
import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { usePacketStageLeaveGuard } from "@/features/packet-flow/hooks/use-packet-stage-leave-guard";
import { usePacketStageStepState } from "@/features/packet-flow/hooks/use-packet-stage-step-state";
import { getPacketStepLabel } from "@/features/packet-flow/lib/packet-field-helpers";
import { derivePacketStageProgressItems } from "@/features/packet-flow/lib/packet-stage-progress";
import {
	getAdjacentPacketPageHrefs,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { getPacketStagePageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

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
	const { previousHref, nextHref } = getAdjacentPacketPageHrefs(
		stageId,
		stepId,
	);
	const saveProjectDefinitionFacts = useMutation(
		api.packet.saveProjectDefinitionFacts,
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const {
		handleLinkNavigation,
		isDialogOpen,
		leaveWithoutSaving,
		navigateToHref,
		requestNavigation,
		stayOnPage,
	} = usePacketStageLeaveGuard({
		hasUnsavedChanges,
	});
	const {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		goToPreviousStep,
		handleFieldChange,
		handleSaveAndContinue,
		isSaving,
	} = usePacketStageStepState({
		navigateToHref,
		onDirtyChange: setHasUnsavedChanges,
		requestNavigation,
		stage,
		stageId,
		stageStatus,
		stepId,
		previousHref,
		nextHref,
		projectFacts: workspaceState.projectDefinition?.facts ?? {},
		saveProjectDefinitionFacts,
	});
	const stepHeading = getPacketStepLabel(stageId, stepId) ?? currentStep.label;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			primaryNav={{
				kind: "packet",
				currentStageId: stageId,
				activeStepId: stepId,
				stageStatuses: workspaceState.stageStatuses,
				onLinkNavigate: handleLinkNavigation,
				onNavigate: requestNavigation,
			}}
		>
			<div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-6 px-4 pb-10 pt-4">
				<div className="space-y-4">
					<PacketStageStepStrip
						stageId={stageId}
						activeStepId={stepId}
						progressItems={progressItems}
						onNavigate={requestNavigation}
					/>
				</div>

				<div className="grid gap-x-12 gap-y-8 xl:grid-cols-[minmax(0,1fr)_30rem] xl:gap-x-16">
					<div className="space-y-6 pt-2">
						<PacketStageStepCard
							currentStep={currentStep}
							stepHeading={stepHeading}
							currentStepIndex={stage.steps.findIndex(
								(packetStep) => packetStep.id === currentStep.id,
							)}
							totalSteps={stage.steps.length}
							canGoBack={Boolean(previousHref)}
							draftValues={currentDraftValues}
							facts={workspaceState.projectDefinition?.facts ?? {}}
							fieldErrors={currentFieldErrors}
							feedback={currentFeedback}
							isSaving={isSaving}
							onBack={goToPreviousStep}
							onChange={handleFieldChange}
							onSaveAndContinue={handleSaveAndContinue}
						/>
					</div>
					<aside className="space-y-10 xl:sticky xl:top-0 xl:self-start">
						{stagePageMedia ? (
							<PacketVideoCard content={stagePageMedia} />
						) : null}
						<PacketStageSidebar
							stage={stage}
							stageStatus={stageStatus}
							nextStageId={nextStageId}
							onLinkNavigate={handleLinkNavigation}
							onNavigate={requestNavigation}
						/>
					</aside>
				</div>
			</div>
			<PacketStageLeaveDialog
				isOpen={isDialogOpen}
				onLeaveWithoutSaving={leaveWithoutSaving}
				onStay={stayOnPage}
			/>
		</AppShell>
	);
}
