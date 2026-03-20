"use client";

import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { LessonPageFooter } from "@/features/course/lesson/components/lesson-page-footer";
import { LessonPageLockedCard } from "@/features/course/lesson/components/lesson-page-locked-card";
import { LessonPageSkeleton } from "@/features/course/lesson/components/lesson-page-skeleton";
import { useLessonPage } from "@/features/course/lesson/hooks/use-lesson-page";
import {
	LessonShellFocus,
	LessonShellSplit,
	LessonShellWatch,
} from "@/features/course/lesson/shells";
import type { MissionState } from "@/features/course/mission/lib/mission-page-model";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench";
import { AppShell } from "@/features/course/shared/components/app-shell";

function LessonPageInner({
	lessonId,
	mission,
}: {
	lessonId: string;
	mission?: MissionState;
}) {
	const router = useRouter();
	const {
		lesson,
		lessonContent,
		isWatchLesson,
		lessonState,
		shellProps,
		completionCue,
		chromeState,
		setActiveCoachPanel,
		pinnedArtifacts,
		fieldValues,
		fieldValuesReady,
		objectiveTasks,
		invalidFieldIds,
		invalidFieldMessages,
		setValue,
		setObjectiveTaskChecked,
		completionAction,
		footerProps,
	} = useLessonPage(lessonId);

	if (lessonState === undefined) {
		return (
			<AppShell {...shellProps} mission={mission}>
				<LessonPageSkeleton
					shell={lesson.shell}
					layoutMode={chromeState.layoutMode}
				/>
			</AppShell>
		);
	}

	if (lessonState.accessStatus === "locked") {
		return (
			<AppShell currentLessonId={lessonId} mission={mission}>
				<LessonPageLockedCard
					lessonId={lesson.id}
					shortTitle={lesson.shortTitle}
					prevLessonId={lesson.prevLessonId ?? null}
					onGoBack={() => router.back()}
				/>
			</AppShell>
		);
	}

	const footer = <LessonPageFooter {...footerProps} />;
	const workbench = isWatchLesson ? null : (
		<WorkbenchRenderer
			lesson={lesson}
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={setValue}
			pinnedArtifacts={pinnedArtifacts}
			layoutMode={chromeState.layoutMode}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			fieldValuesReady={fieldValuesReady}
			workbenchCompletionSlot={
				lesson.id === "1.1" || lesson.id === "1.4" || lesson.id === "1.9"
					? completionAction
					: undefined
			}
		/>
	);

	return (
		<AppShell {...shellProps} completionCue={completionCue} mission={mission}>
			{isWatchLesson ? (
				<LessonShellWatch
					lesson={lesson}
					coachContent={lessonContent.coach}
					footer={footer}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : chromeState.layoutMode === "focus" ? (
				<LessonShellFocus
					lesson={lesson}
					coachContent={lessonContent.coach}
					footer={footer}
				>
					{workbench}
				</LessonShellFocus>
			) : (
				<LessonShellSplit
					lesson={lesson}
					activeCoachPanel={chromeState.activeCoachPanel}
					onCoachPanelChange={setActiveCoachPanel}
					objectiveTasks={objectiveTasks}
					onObjectiveTaskToggle={setObjectiveTaskChecked}
					pinnedArtifacts={pinnedArtifacts}
					coachContent={lessonContent.coach}
					footer={footer}
				>
					{workbench}
				</LessonShellSplit>
			)}
		</AppShell>
	);
}

function LessonPagePreloaded({
	lessonId,
	preloadedMission,
}: {
	lessonId: string;
	preloadedMission: Preloaded<typeof api.course.getMissionState>;
}) {
	return (
		<LessonPageInner
			lessonId={lessonId}
			mission={usePreloadedQuery(preloadedMission) as MissionState}
		/>
	);
}

export function LessonPage({
	lessonId,
	preloadedMission,
}: {
	lessonId: string;
	preloadedMission?: Preloaded<typeof api.course.getMissionState> | null;
}) {
	return preloadedMission ? (
		<LessonPagePreloaded
			lessonId={lessonId}
			preloadedMission={preloadedMission}
		/>
	) : (
		<LessonPageInner lessonId={lessonId} />
	);
}
