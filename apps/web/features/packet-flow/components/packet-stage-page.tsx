"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { getPacketStageDefinition } from "@packet-compiler";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/features/course/shared/components/app-shell";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { PacketStageLeaveDialog } from "@/features/packet-flow/components/packet-stage-leave-dialog";
import { PacketStageSidebar } from "@/features/packet-flow/components/packet-stage-sidebar";
import { PacketStageStepCard } from "@/features/packet-flow/components/packet-stage-step-card";
import { PacketStagePager } from "@/features/packet-flow/components/navigation/packet-stage-pager";
import { PacketStageRail } from "@/features/packet-flow/components/navigation/packet-stage-rail";
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
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";

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
	const isPostReviewUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const resumeDestination = useQuery(
		api.packet.getPacketResumeDestination,
		isAuthenticated && !isLoading && isPostReviewUnlocked ? {} : "skip",
	) as
		| {
				postReviewTargets:
					| import("@/features/workspace-navigation/lib/post-review-destination").PostReviewNavigationTargets
					| null;
		  }
		| undefined;
	const bonusMissionState = useQuery(
		api.course.getBonusMissionState,
		isAuthenticated && !isLoading && isPostReviewUnlocked ? {} : "skip",
	) as BonusMissionState | undefined;
	const postReviewItems =
		isPostReviewUnlocked &&
		resumeDestination?.postReviewTargets &&
		bonusMissionState
			? buildPostReviewPrimaryNav({
					activeSection: null,
					missionState: bonusMissionState,
					postReviewTargets: resumeDestination.postReviewTargets,
				})
			: buildLockedPostReviewPrimaryNav();
	const progressItems = derivePacketStageProgressItems(
		stage,
		stageStatus,
		stepId,
	);
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
	const localNav = {
		kind: "packet" as const,
		desktop: (
			<PacketStageRail
				currentStageId={stageId}
				activeStepId={stepId}
				stageStatuses={workspaceState.stageStatuses}
				onLinkNavigate={handleLinkNavigation}
				onNavigate={requestNavigation}
			/>
		),
		compact: (
			<PacketStageStepStrip
				stageId={stageId}
				activeStepId={stepId}
				progressItems={progressItems}
				onNavigate={requestNavigation}
			/>
		),
	};

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			primaryNav={{
				kind: "combined",
				currentPacketStageId: stageId,
				stageStatuses: workspaceState.stageStatuses,
				postReviewItems,
				onLinkNavigate: handleLinkNavigation,
				onNavigate: requestNavigation,
			}}
			localNav={localNav}
		>
			<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 pb-10 pt-4">
				<div className="flex items-center justify-end">
					<PacketStagePager
						previousHref={previousHref}
						nextHref={nextHref}
						onLinkNavigate={handleLinkNavigation}
						onNavigate={requestNavigation}
					/>
				</div>

				<div className="grid gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-x-10">
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

					<aside className="hidden space-y-10 xl:sticky xl:top-4 xl:block xl:self-start">
						{stagePageMedia ? (
							<PacketVideoCard content={stagePageMedia} />
						) : null}
						<PacketStageSidebar stage={stage} stageStatus={stageStatus} />
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
