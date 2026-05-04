"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/app/(workspace)/_components/app-shell";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { CodebaseLocalDraftSeeder } from "@/app/(workspace)/_components/codebase-flow/codebase-local-draft-seeder";
import { CodebasePageBody } from "@/app/(workspace)/_components/codebase-flow/codebase-page-body";
import { CodebaseStageLeaveDialog } from "@/app/(workspace)/_components/codebase-flow/codebase-stage-leave-dialog";
import { useCodebasePageState } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-page-state";
import { useCodebaseStageLeaveGuard } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-stage-leave-guard";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/lib/workspace-navigation/build-primary-nav-model";
import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";

export function CodebasePage({
	initialBonusMissionState = null,
	initialPostReviewTargets = null,
	initialWorkspaceState,
}: {
	initialBonusMissionState?: BonusMissionState | null;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialWorkspaceState: CodebaseWorkspaceState;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.codebase.getCodebaseWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as CodebaseWorkspaceState | undefined;
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
		api.codebase.saveProjectDefinitionFacts,
	);
	const unlockExecuteShip = useMutation(api.codebase.unlockExecuteShip);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const {
		handleLinkNavigation,
		isDialogOpen,
		leaveWithoutSaving,
		navigateToHref,
		requestNavigation,
		stayOnPage,
	} = useCodebaseStageLeaveGuard({
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
	} = useCodebasePageState({
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
			title="Codebase"
			primaryNav={{
				kind: "combined",
				currentCodebaseStageId: "codebase",
				stageStatuses: workspaceState.stageStatuses,
				postReviewItems,
				onLinkNavigate: handleLinkNavigation,
				onNavigate: requestNavigation,
			}}
		>
			<CodebaseLocalDraftSeeder workspaceState={liveWorkspaceState} />
			<CodebasePageBody
				currentDraftValues={currentDraftValues}
				currentFacts={currentFacts}
				currentFieldErrors={currentFieldErrors}
				currentSectionStatuses={currentSectionStatuses}
				feedback={feedback}
				handleFieldChange={handleFieldChange}
				handleSaveAndContinue={handleSaveAndContinue}
				isReviewReady={isReviewReady}
				isSaving={isSaving}
				lastSavedAt={workspaceState.projectDefinition?.updatedAt ?? null}
			/>
			<CodebaseStageLeaveDialog
				isOpen={isDialogOpen}
				onLeaveWithoutSaving={leaveWithoutSaving}
				onStay={stayOnPage}
			/>
		</AppShell>
	);
}
