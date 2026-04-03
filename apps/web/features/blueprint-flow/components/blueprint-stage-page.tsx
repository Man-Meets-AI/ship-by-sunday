"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { getBlueprintStageDefinition } from "@blueprint-compiler";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/features/course/shared/components/app-shell";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { BlueprintStageLeaveDialog } from "@/features/blueprint-flow/components/blueprint-stage-leave-dialog";
import { BlueprintStageSidebar } from "@/features/blueprint-flow/components/blueprint-stage-sidebar";
import { BlueprintStageStepCard } from "@/features/blueprint-flow/components/blueprint-stage-step-card";
import { BlueprintStagePager } from "@/features/blueprint-flow/components/navigation/blueprint-stage-pager";
import { BlueprintStageRail } from "@/features/blueprint-flow/components/navigation/blueprint-stage-rail";
import { BlueprintStageStepStrip } from "@/features/blueprint-flow/components/progression/blueprint-stage-step-strip";
import { BlueprintVideoCard } from "@/features/blueprint-flow/components/video/blueprint-video-card";
import { useBlueprintStageLeaveGuard } from "@/features/blueprint-flow/hooks/use-blueprint-stage-leave-guard";
import { useBlueprintStageStepState } from "@/features/blueprint-flow/hooks/use-blueprint-stage-step-state";
import { getBlueprintStepLabel } from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import { deriveBlueprintStageProgressItems } from "@/features/blueprint-flow/lib/blueprint-stage-progress";
import {
	getAdjacentBlueprintPageHrefs,
	type RoutedBlueprintStageId,
} from "@/features/blueprint-flow/lib/blueprint-stage-routes";
import { getBlueprintStagePageMedia } from "@/features/blueprint-flow/lib/blueprint-stage-videos";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";

export function BlueprintStagePage({
	stageId,
	stepId,
	initialWorkspaceState,
}: {
	stageId: RoutedBlueprintStageId;
	stepId: string;
	initialWorkspaceState: BlueprintWorkspaceState;
}) {
	const stage = getBlueprintStageDefinition(stageId);
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.blueprint.getBlueprintWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as BlueprintWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const stageStatus = workspaceState.stageStatuses.find(
		(item) => item.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing blueprint stage status for ${stageId}`);
	}
	if (!stageStatus.isUnlocked) {
		redirect(
			getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	const stagePageMedia = getBlueprintStagePageMedia(stageId, stepId);
	const isPostReviewUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const resumeDestination = useQuery(
		api.blueprint.getBlueprintResumeDestination,
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
	const progressItems = deriveBlueprintStageProgressItems(
		stage,
		stageStatus,
		stepId,
	);
	const { previousHref, nextHref } = getAdjacentBlueprintPageHrefs(
		stageId,
		stepId,
	);
	const saveProjectDefinitionFacts = useMutation(
		api.blueprint.saveProjectDefinitionFacts,
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const {
		handleLinkNavigation,
		isDialogOpen,
		leaveWithoutSaving,
		navigateToHref,
		requestNavigation,
		stayOnPage,
	} = useBlueprintStageLeaveGuard({
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
	} = useBlueprintStageStepState({
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
	const stepHeading =
		getBlueprintStepLabel(stageId, stepId) ?? currentStep.label;
	const localNav = {
		kind: "blueprint" as const,
		desktop: (
			<BlueprintStageRail
				currentStageId={stageId}
				activeStepId={stepId}
				stageStatuses={workspaceState.stageStatuses}
				onLinkNavigate={handleLinkNavigation}
				onNavigate={requestNavigation}
			/>
		),
		compact: (
			<BlueprintStageStepStrip
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
				currentBlueprintStageId: stageId,
				stageStatuses: workspaceState.stageStatuses,
				postReviewItems,
				onLinkNavigate: handleLinkNavigation,
				onNavigate: requestNavigation,
			}}
			localNav={localNav}
		>
			<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 pb-10 pt-4">
				<div className="flex items-center justify-end">
					<BlueprintStagePager
						previousHref={previousHref}
						nextHref={nextHref}
						onLinkNavigate={handleLinkNavigation}
						onNavigate={requestNavigation}
					/>
				</div>

				<div className="grid gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-x-10">
					<div className="space-y-6 pt-2">
						<BlueprintStageStepCard
							currentStep={currentStep}
							stepHeading={stepHeading}
							currentStepIndex={stage.steps.findIndex(
								(blueprintStep) => blueprintStep.id === currentStep.id,
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
							<BlueprintVideoCard content={stagePageMedia} />
						) : null}
						<BlueprintStageSidebar stage={stage} stageStatus={stageStatus} />
					</aside>
				</div>
			</div>
			<BlueprintStageLeaveDialog
				isOpen={isDialogOpen}
				onLeaveWithoutSaving={leaveWithoutSaving}
				onStay={stayOnPage}
			/>
		</AppShell>
	);
}
