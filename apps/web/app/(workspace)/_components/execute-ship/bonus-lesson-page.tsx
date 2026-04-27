"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import type { BlueprintStageStatus } from "@shipbysunday/blueprint-compiler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LessonShellWatch } from "@/app/(workspace)/_components/course/lesson/shells";
import { getLessonByKey } from "@/lib/course/lesson/model/manifest";
import { AppShell } from "@/app/(workspace)/_components/app-shell";
import {
	buildBonusShellMission,
	getRecommendedBuildLessonHref,
} from "@/lib/execute-ship/bonus-library-presentation";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { buildPostReviewPrimaryNav } from "@/lib/workspace-navigation/build-primary-nav-model";
import { buildWorkspaceLessonLocalNavModel } from "@/lib/workspace-navigation/build-secondary-nav-model";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";
import { BonusLessonFooter } from "./bonus-lesson-footer";
import { LessonMapSurface } from "./lesson-map-surface";
import { BonusLessonViewTracker } from "./bonus-lesson-view-tracker";

export function BonusLessonPage({
	initialShowLessonMap = false,
	initialStageStatuses,
	lessonKey,
	missionState,
	postReviewTargets,
}: {
	initialShowLessonMap?: boolean;
	initialStageStatuses: BlueprintStageStatus[];
	lessonKey: string;
	missionState: BonusMissionState;
	postReviewTargets: PostReviewNavigationTargets;
}) {
	const lesson = getLessonByKey(lessonKey);

	if (!lesson) {
		throw new Error(`Unknown lesson ${lessonKey}`);
	}

	const [showLessonMap, setShowLessonMap] = useState(initialShowLessonMap);
	const activeSection =
		lesson.block === "BUILD"
			? "build"
			: lesson.block === "SHIP"
				? "launch"
				: "bonus";
	const localNav = {
		kind: "workspace" as const,
		desktop: (
			<WorkspaceLocalNavRail
				model={buildWorkspaceLessonLocalNavModel({
					currentLesson: lesson,
					missionState,
				})}
			/>
		),
	};

	return (
		<>
			<BonusLessonViewTracker lessonKey={lessonKey} />
			<AppShell
				viewportMode="app"
				appScrollMode="page"
				mission={buildBonusShellMission(missionState)}
				localNav={localNav}
				showSkillRail
				currentLessonId={lessonKey}
				primaryNav={{
					kind: "combined",
					stageStatuses: initialStageStatuses,
					postReviewItems: buildPostReviewPrimaryNav({
						activeSection,
						activeBonusBlockId:
							lesson.block === "CEO" || lesson.block === "DESIGN"
								? lesson.block
								: null,
						missionState,
						postReviewTargets,
					}),
					onAction: (actionId) => {
						if (actionId === "showLessonMap") {
							setShowLessonMap(true);
						}
					},
				}}
			>
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-10 pt-2">
					<Alert>
						<AlertCircleIcon aria-hidden />
						<AlertTitle>Video-first bonus lesson</AlertTitle>
						<AlertDescription>
							Use the blueprint as the brief and keep BUILD as the default path.
							Browse bonus lessons from{" "}
							<button
								type="button"
								className="font-medium text-foreground underline"
								onClick={() => setShowLessonMap(true)}
							>
								the Lesson Map
							</button>
							, and if you need to restart, jump back to{" "}
							<Link
								className="font-medium text-foreground underline"
								href={getRecommendedBuildLessonHref(missionState)}
							>
								3.1
							</Link>
							.
						</AlertDescription>
					</Alert>
					{showLessonMap ? (
						<LessonMapSurface
							missionState={missionState}
							currentBlockId={lesson.block}
						/>
					) : null}
					<LessonShellWatch
						lesson={lesson}
						coachContent={lesson.content.coach}
						footer={
							<BonusLessonFooter
								lessonKey={lessonKey}
								onOpenLessonMap={() => setShowLessonMap(true)}
							/>
						}
						pinnedArtifacts={[]}
					/>
				</div>
			</AppShell>
		</>
	);
}
