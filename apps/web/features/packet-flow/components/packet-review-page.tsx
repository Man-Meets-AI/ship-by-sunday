"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { getPacketStageDefinition } from "@packet-compiler";
import type { FunctionReturnType } from "convex/server";
import { redirect } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { LessonMapSurface } from "@/features/execute-ship/components/lesson-map-surface";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";
import {
	buildReviewLocalNavModel,
	REVIEW_DOWNLOADS_ID,
	REVIEW_LESSON_MAP_ID,
	REVIEW_OVERVIEW_ID,
} from "@/features/workspace-navigation/lib/build-secondary-nav-model";
import { WorkspaceLocalNavRail } from "@/features/workspace-navigation/components/workspace-local-nav-rail";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { getPacketReviewPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { PacketReviewDownloadBridge } from "./review/packet-review-download-bridge";

type PacketResumeDestination = FunctionReturnType<
	typeof api.packet.getPacketResumeDestination
>;

export function PacketReviewPage({
	initialWorkspaceState,
	initialPostReviewTargets = null,
	initialBonusMissionState = null,
	initialShowLessonMap = false,
}: {
	initialWorkspaceState: PacketWorkspaceState;
	initialPostReviewTargets?: PostReviewNavigationTargets | null;
	initialBonusMissionState?: BonusMissionState | null;
	initialShowLessonMap?: boolean;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.packet.getPacketWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as PacketWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const reviewStageStatus = workspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "review",
	);
	if (reviewStageStatus && !reviewStageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	const isUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const liveResumeDestination = useQuery(
		api.packet.getPacketResumeDestination,
		isAuthenticated && !isLoading && isUnlocked ? {} : "skip",
	) as PacketResumeDestination | undefined;
	const liveBonusMissionState = useQuery(
		api.course.getBonusMissionState,
		isAuthenticated && !isLoading && isUnlocked ? {} : "skip",
	) as BonusMissionState | undefined;
	const [showLessonMap, setShowLessonMap] = useState(initialShowLessonMap);
	const postReviewTargets =
		liveResumeDestination?.postReviewTargets ?? initialPostReviewTargets;
	const bonusMissionState = liveBonusMissionState ?? initialBonusMissionState;
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
			title="Review & Download"
			localNav={localNav}
			primaryNav={{
				kind: "combined",
				currentPacketStageId: "review",
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
								What you&apos;re downloading and how to use it
							</h2>
							<p className="text-base leading-relaxed text-muted-foreground">
								This is the handoff. Watch this first, then download your Ship
								Kit and keep moving while the context is still hot.
							</p>
						</div>
						<PacketVideoCard content={getPacketReviewPageMedia()} />
					</section>

					<div id={REVIEW_DOWNLOADS_ID} className="scroll-mt-24">
						<PacketReviewDownloadBridge
							workspaceState={workspaceState}
							postReviewTargets={postReviewTargets}
							onOpenLessonMap={
								bonusMissionState ? () => setShowLessonMap(true) : undefined
							}
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
