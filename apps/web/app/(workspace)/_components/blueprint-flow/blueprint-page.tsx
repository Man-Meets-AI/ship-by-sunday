"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/app/(workspace)/_components/app-shell";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { BlueprintLocalDraftSeeder } from "@/app/(workspace)/_components/blueprint-flow/blueprint-local-draft-seeder";
import { BlueprintPageBody } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-body";
import { BlueprintStageLeaveDialog } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-leave-dialog";
import { useBlueprintPageState } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-page-state";
import { useBlueprintStageLeaveGuard } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-stage-leave-guard";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/lib/workspace-navigation/build-primary-nav-model";
import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";

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
			<BlueprintLocalDraftSeeder workspaceState={liveWorkspaceState} />
			<BlueprintPageBody
				currentDraftValues={currentDraftValues}
				currentFacts={currentFacts}
				currentFieldErrors={currentFieldErrors}
				currentSectionStatuses={currentSectionStatuses}
				feedback={feedback}
				handleFieldChange={handleFieldChange}
				handleSaveAndContinue={handleSaveAndContinue}
				isReviewReady={isReviewReady}
				isSaving={isSaving}
			/>
			<BlueprintStageLeaveDialog
				isOpen={isDialogOpen}
				onLeaveWithoutSaving={leaveWithoutSaving}
				onStay={stayOnPage}
			/>
		</AppShell>
	);
}
