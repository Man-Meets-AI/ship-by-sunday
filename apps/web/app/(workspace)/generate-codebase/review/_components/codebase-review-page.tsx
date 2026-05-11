"use client";

import { useConvexAuth, useQuery } from "convex/react";
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
import { CodebaseVideoCard } from "@/app/(workspace)/_components/codebase-flow/video/codebase-video-card";
import { REVIEW_SURFACE_TITLE } from "@/lib/codebase-flow/review-download-handoff";
import { getCodebaseReviewPageMedia } from "@/lib/codebase-flow/codebase-stage-videos";
import { getCodebaseStageRoute } from "@/lib/codebase-flow/codebase-stage-nav-model";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";
import { CodebaseReviewDownloadBridge } from "./codebase-review-download-bridge";

type CodebaseResumeDestination = FunctionReturnType<
	typeof api.codebase.getCodebaseResumeDestination
>;

export function CodebaseReviewPage({
	initialWorkspaceState,
	initialPostReviewTargets = null,
	initialBonusMissionState = null,
	initialAutoDownload = false,
	initialShowLessonMap = false,
}: {
	initialWorkspaceState: CodebaseWorkspaceState;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialBonusMissionState?: BonusMissionState | null;
	initialAutoDownload?: boolean;
	initialShowLessonMap?: boolean;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.codebase.getCodebaseWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as CodebaseWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const reviewStageStatus = workspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "review",
	);
	if (reviewStageStatus && !reviewStageStatus.isUnlocked) {
		redirect(getCodebaseStageRoute(workspaceState.firstIncompleteStageId));
	}

	const isUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const liveResumeDestination = useQuery(
		api.codebase.getCodebaseResumeDestination,
		isAuthenticated && !isLoading && isUnlocked ? {} : "skip",
	) as CodebaseResumeDestination | undefined;
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
				currentCodebaseStageId: "review",
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
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-16 pt-2">
				<div className="flex flex-col gap-8">
					<section id={REVIEW_OVERVIEW_ID} className="space-y-4 scroll-mt-24">
						<div className="space-y-2">
							<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
								What you just got and where to go next
							</h2>
							<p className="text-base leading-relaxed text-muted-foreground">
								This is the handoff. Watch this first, then move straight into
								Build Lessons while the codebase context is still hot.
							</p>
						</div>
						<CodebaseVideoCard content={getCodebaseReviewPageMedia()} />
					</section>

					<div id={REVIEW_HANDOFF_ID} className="scroll-mt-24">
						<CodebaseReviewDownloadBridge
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
