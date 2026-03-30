"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LessonShellWatch } from "@/features/course/lesson/shells";
import { getLessonByKey } from "@/features/course/lesson/model/manifest";
import { AppShell } from "@/features/course/shared/components/app-shell";
import {
	buildBonusShellMission,
	getRecommendedBuildLessonHref,
} from "@/features/execute-ship/lib/bonus-library-presentation";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { buildPostReviewPrimaryNav } from "@/features/workspace-navigation/lib/build-primary-nav-model";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { BonusLessonFooter } from "./bonus-lesson-footer";
import { LessonMapSurface } from "./lesson-map-surface";
import { BonusLessonViewTracker } from "./bonus-lesson-view-tracker";

export function BonusLessonPage({
	initialShowLessonMap = false,
	lessonKey,
	missionState,
	postReviewTargets,
}: {
	initialShowLessonMap?: boolean;
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

	return (
		<>
			<BonusLessonViewTracker lessonKey={lessonKey} />
			<AppShell
				viewportMode="app"
				appScrollMode="page"
				mission={buildBonusShellMission(missionState)}
				showSkillRail
				currentLessonId={lessonKey}
				primaryNav={{
					kind: "workspace",
					items: buildPostReviewPrimaryNav({
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
							Use the packet as the brief and keep BUILD as the default path.
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
