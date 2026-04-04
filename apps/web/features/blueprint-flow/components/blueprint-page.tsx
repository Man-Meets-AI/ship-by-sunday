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
	const missingRequiredCount = currentSectionStatuses.reduce(
		(sum, sectionStatus) => sum + sectionStatus.missingFactKeys.length,
		0,
	);
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
			localNav={{
				kind: "blueprint",
				compact: (
					<nav
						aria-label="Blueprint section shortcuts"
						className="flex gap-2 overflow-x-auto pb-1"
					>
						{blueprintPageSections.map((section) => (
							<a
								key={section.id}
								href={`#${section.id}`}
								className="shrink-0 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
							>
								{section.label}
							</a>
						))}
					</nav>
				),
				desktop: (
					<BlueprintPageProgressSidebar
						sectionStatuses={currentSectionStatuses}
					/>
				),
			}}
		>
			<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 pb-12 pt-4">
				<div className="space-y-6 pt-2">
					<BlueprintPageOverview
						isReviewReady={isReviewReady}
						missingRequiredCount={missingRequiredCount}
					/>
					{blueprintPageSections.map((section) => {
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
								facts={workspaceState.projectDefinition?.facts ?? {}}
								fieldErrors={currentFieldErrors}
								isComplete={sectionStatus.isComplete}
								missingCount={sectionStatus.missingFactKeys.length}
								onChange={handleFieldChange}
								section={section}
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
