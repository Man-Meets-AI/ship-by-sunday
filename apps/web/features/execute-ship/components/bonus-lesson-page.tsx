import Link from "next/link";
import { LessonShellWatch } from "@/features/course/lesson/shells";
import { getLessonByKey } from "@/features/course/lesson/model/manifest";
import { AppShell } from "@/features/course/shared/components/app-shell";
import {
	buildBonusShellMission,
	getRecommendedBuildLessonHref,
} from "@/features/execute-ship/lib/bonus-library-presentation";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { BonusLessonFooter } from "./bonus-lesson-footer";
import { BonusLessonViewTracker } from "./bonus-lesson-view-tracker";

export function BonusLessonPage({
	lessonKey,
	missionState,
}: {
	lessonKey: string;
	missionState: BonusMissionState;
}) {
	const lesson = getLessonByKey(lessonKey);

	if (!lesson) {
		throw new Error(`Unknown lesson ${lessonKey}`);
	}

	return (
		<>
			<BonusLessonViewTracker lessonKey={lessonKey} />
			<AppShell
				viewportMode="app"
				appScrollMode="page"
				enableMissionQuery={false}
				mission={buildBonusShellMission(missionState)}
				showMissionRail
				showSkillRail
				currentLessonId={lessonKey}
			>
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-10 pt-2">
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
						This bonus lesson is video-first. Use the packet as the brief, keep
						BUILD as the recommended path, and return to the library whenever
						you want a different reference shelf. Once you start the bonus
						funnel, the Execute / Ship route sends repeat visits back to the
						library, so use{" "}
						<Link
							className="font-medium text-foreground underline"
							href="/mission"
						>
							Mission
						</Link>{" "}
						as the browseable home and keep{" "}
						<Link
							className="font-medium text-foreground underline"
							href={getRecommendedBuildLessonHref(missionState)}
						>
							3.1
						</Link>{" "}
						as the recommended BUILD restart point.
					</div>
					<LessonShellWatch
						lesson={lesson}
						coachContent={lesson.content.coach}
						footer={<BonusLessonFooter lessonKey={lessonKey} />}
						pinnedArtifacts={[]}
					/>
				</div>
			</AppShell>
		</>
	);
}
