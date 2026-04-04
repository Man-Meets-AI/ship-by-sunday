"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/features/course/shared/components/app-shell";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { BlueprintStageLeaveDialog } from "@/features/blueprint-flow/components/blueprint-stage-leave-dialog";
import { BlueprintPageOverview } from "@/features/blueprint-flow/components/blueprint-page-overview";
import { BlueprintPageProgressSidebar } from "@/features/blueprint-flow/components/blueprint-page-progress-sidebar";
import { BlueprintPageSaveBar } from "@/features/blueprint-flow/components/blueprint-page-save-bar";
import { BlueprintPageSectionCard } from "@/features/blueprint-flow/components/blueprint-page-section-card";
import { useBlueprintPageState } from "@/features/blueprint-flow/hooks/use-blueprint-page-state";
import { useBlueprintStageLeaveGuard } from "@/features/blueprint-flow/hooks/use-blueprint-stage-leave-guard";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";

export function BlueprintPage({
	initialBonusMissionState = null,
	initialPostReviewTargets = null,
	initialWorkspaceState,
}: {
	initialBonusMissionState?: BonusMissionState | null;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialWorkspaceState: BlueprintWorkspaceState;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.blueprint.getBlueprintWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as BlueprintWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const isPostReviewUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const postReviewItems =
		isPostReviewUnlocked && initialPostReviewTargets && initialBonusMissionState
			? buildPostReviewPrimaryNav({
					activeSection: null,
					missionState: initialBonusMissionState,
					postReviewTargets: initialPostReviewTargets,
				})
			: buildLockedPostReviewPrimaryNav();
	const saveProjectDefinitionFacts = useMutation(
		api.blueprint.saveProjectDefinitionFacts,
	);
	const unlockExecuteShip = useMutation(api.blueprint.unlockExecuteShip);
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
		currentDraftValues,
		currentFacts,
		currentFieldErrors,
		currentSectionStatuses,
		feedback,
		handleFieldChange,
		handleSaveAndContinue,
		isReviewReady,
		isSaving,
	} = useBlueprintPageState({
		navigateToHref,
		onDirtyChange: setHasUnsavedChanges,
		projectFacts: workspaceState.projectDefinition?.facts ?? {},
		saveProjectDefinitionFacts,
		unlockExecuteShip,
	});
	const completedSectionCount = currentSectionStatuses.filter(
		(s) => s.isComplete,
	).length;
	const sectionStatusById = new Map(
		currentSectionStatuses.map((sectionStatus) => [
			sectionStatus.sectionId,
			sectionStatus,
		]),
	);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Blueprint"
			primaryNav={{
				kind: "combined",
				currentBlueprintStageId: "blueprint",
				stageStatuses: workspaceState.stageStatuses,
				postReviewItems,
				onLinkNavigate: handleLinkNavigation,
				onNavigate: requestNavigation,
			}}
		>
			<div className="mx-auto flex w-full max-w-4xl flex-1 gap-10 px-4 pb-20 pt-4">
				<div className="hidden w-48 shrink-0 xl:block">
					<div className="sticky top-20">
						<BlueprintPageProgressSidebar
							sectionStatuses={currentSectionStatuses}
						/>
					</div>
				</div>
				<div className="flex w-full min-w-0 max-w-2xl flex-1 flex-col">
					<BlueprintPageOverview
						completedSectionCount={completedSectionCount}
						totalSectionCount={currentSectionStatuses.length}
					/>
					{blueprintPageSections.map((section, index) => {
						const sectionStatus = sectionStatusById.get(section.id);
						if (!sectionStatus) {
							throw new Error(
								`Missing blueprint page section status for ${section.id}`,
							);
						}

						return (
							<BlueprintPageSectionCard
								key={section.id}
								draftValues={currentDraftValues}
								facts={currentFacts}
								fieldErrors={currentFieldErrors}
								isComplete={sectionStatus.isComplete}
								onChange={handleFieldChange}
								section={section}
								sectionNumber={index + 1}
							/>
						);
					})}
					<BlueprintPageSaveBar
						feedback={feedback}
						isReviewReady={isReviewReady}
						isSaving={isSaving}
						onSaveAndContinue={handleSaveAndContinue}
					/>
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
