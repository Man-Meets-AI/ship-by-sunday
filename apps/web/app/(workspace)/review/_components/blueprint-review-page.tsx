"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { getBlueprintStageDefinition } from "@shipbysunday/blueprint-compiler";
import type { FunctionReturnType } from "convex/server";
import { redirect } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { LessonMapSurface } from "@/app/(workspace)/_components/execute-ship/lesson-map-surface";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/lib/workspace-navigation/build-primary-nav-model";
import {
	buildReviewLocalNavModel,
	REVIEW_HANDOFF_ID,
	REVIEW_LESSON_MAP_ID,
	REVIEW_OVERVIEW_ID,
} from "@/lib/workspace-navigation/build-secondary-nav-model";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	getDefaultBuildLessonsDestination,
	type PostReviewNavigationTargets,
} from "@/lib/workspace-navigation/post-review-destination";
import { BlueprintVideoCard } from "@/app/(workspace)/_components/blueprint-flow/video/blueprint-video-card";
import { REVIEW_SURFACE_TITLE } from "@/lib/blueprint-flow/review-download-handoff";
import { getBlueprintReviewPageMedia } from "@/lib/blueprint-flow/blueprint-stage-videos";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";
import { BlueprintReviewDownloadBridge } from "./blueprint-review-download-bridge";

type BlueprintResumeDestination = FunctionReturnType<
	typeof api.blueprint.getBlueprintResumeDestination
>;

export function BlueprintReviewPage({
	initialWorkspaceState,
	initialPostReviewTargets = null,
	initialBonusMissionState = null,
	initialAutoDownload = false,
	initialShowLessonMap = false,
}: {
	initialWorkspaceState: BlueprintWorkspaceState;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialBonusMissionState?: BonusMissionState | null;
	initialAutoDownload?: boolean;
	initialShowLessonMap?: boolean;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.blueprint.getBlueprintWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as BlueprintWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const reviewStageStatus = workspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "review",
	);
	if (reviewStageStatus && !reviewStageStatus.isUnlocked) {
		redirect(
			getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	const isUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const liveResumeDestination = useQuery(
		api.blueprint.getBlueprintResumeDestination,
		isAuthenticated && !isLoading && isUnlocked ? {} : "skip",
	) as BlueprintResumeDestination | undefined;
	const liveBonusMissionState = useQuery(
		api.course.getBonusMissionState,
		isAuthenticated && !isLoading && isUnlocked ? {} : "skip",
	) as BonusMissionState | undefined;
	const [showLessonMap, setShowLessonMap] = useState(initialShowLessonMap);
	const postReviewTargets =
		liveResumeDestination?.postReviewTargets ?? initialPostReviewTargets;
	const bonusMissionState = liveBonusMissionState ?? initialBonusMissionState;
	const buildLessonsFallbackHref = getDefaultBuildLessonsDestination();
	const localNav =
		isUnlocked && postReviewTargets && bonusMissionState
			? {
					kind: "review" as const,
					desktop: (
						<WorkspaceLocalNavRail
							model={buildReviewLocalNavModel({
								isLessonMapVisible: showLessonMap,
								postReviewTargets,
							})}
						/>
					),
				}
			: undefined;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title={REVIEW_SURFACE_TITLE}
			localNav={localNav}
			primaryNav={{
				kind: "combined",
				currentBlueprintStageId: "review",
				stageStatuses: workspaceState.stageStatuses,
				postReviewItems:
					isUnlocked && postReviewTargets && bonusMissionState
						? buildPostReviewPrimaryNav({
								activeSection: null,
								missionState: bonusMissionState,
								postReviewTargets,
							})
						: buildLockedPostReviewPrimaryNav(),
				onAction: (actionId) => {
					if (actionId === "showLessonMap") {
						setShowLessonMap(true);
					}
				},
			}}
		>
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 pb-20 pt-2">
				<div className="flex flex-col gap-12">
					<section id={REVIEW_OVERVIEW_ID} className="space-y-4 scroll-mt-24">
						<div className="space-y-2">
							<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
								What you just got and where to go next
							</h2>
							<p className="text-base leading-relaxed text-muted-foreground">
								This is the handoff. Watch this first, then move straight into
								Build Lessons while the blueprint context is still hot.
							</p>
						</div>
						<BlueprintVideoCard content={getBlueprintReviewPageMedia()} />
					</section>

					<div id={REVIEW_HANDOFF_ID} className="scroll-mt-24">
						<BlueprintReviewDownloadBridge
							autoDownloadEnabled={initialAutoDownload}
							buildLessonsFallbackHref={buildLessonsFallbackHref}
							postReviewTargets={postReviewTargets}
						/>
					</div>
					{showLessonMap && bonusMissionState ? (
						<LessonMapSurface
							id={REVIEW_LESSON_MAP_ID}
							missionState={bonusMissionState}
						/>
					) : null}
				</div>
			</div>
		</AppShell>
	);
}
